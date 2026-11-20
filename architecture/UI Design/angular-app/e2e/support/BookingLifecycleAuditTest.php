<?php

namespace Tests\Feature;

use App\Models\UserNotification;
use App\Services\JwtTokenService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Modules\Booking\Models\LoadApplication;
use Modules\Booking\Models\MarketplaceBooking;
use Modules\Booking\Models\MarketplaceDriver;
use Modules\Booking\Models\MarketplaceVehicle;
use Modules\Booking\Services\CommissionService;
use Modules\User\Models\User;
use Tests\TestCase;

/** Run from the API repository with its phpunit.xml; all fixtures roll back. */
class BookingLifecycleAuditTest extends TestCase
{
    use DatabaseTransactions;

    private array $steps = [];

    protected function setUp(): void
    {
        parent::setUp();
        if (!app()->environment('testing') || DB::connection()->getDatabaseName() !== 'transportseva_employee_test') {
            throw new \RuntimeException('Only the isolated transportseva_employee_test database is allowed.');
        }
        Http::preventStrayRequests();
        Mail::fake();
        Storage::fake('local');
        config(['transportseva.payment_provider'=>'mock', 'transportseva.marketplace.require_approved_kyc'=>false,
            'transportseva.commission.threshold'=>10000,'transportseva.commission.fixed_fee'=>300,
            'transportseva.commission.percentage_bps'=>500,'transportseva.commission.tax_bps'=>1800,
            'transportseva.booking_token_amount'=>1000]);
    }

    public static function paymentPlans(): array
    {
        return ['advance released'=>[true,8200,9203], 'advance not released'=>[false,15000,16003]];
    }

    #[\PHPUnit\Framework\Attributes\DataProvider('paymentPlans')]
    public function test_complete_booking_with_two_applicants_negotiation_tokens_pod_and_settlement(bool $releaseAdvance, float $finalFreight, float $finalDue): void
    {
        $shipper=$this->user('customer'); $provider=$this->user('truck-owner'); $competitor=$this->user('truck-owner');
        $vehicle=$this->vehicle($provider); $otherVehicle=$this->vehicle($competitor);
        $driver=MarketplaceDriver::create(['uuid'=>(string)Str::uuid(),'owner_uuid'=>$provider->uuid,'name'=>'Isolated audit driver',
            'phone'=>'9000000123','license_number'=>'AUDIT'.Str::upper(Str::random(12)),'status'=>'available']);
        $this->as($shipper);
        $load=$this->postJson('/api/loads',['posted_by_role'=>'shipper','posted_by_name'=>'Isolated audit shipper',
            'pickup_city'=>'Delhi','drop_city'=>'Navi Mumbai','material'=>'Isolated booking audit goods',
            'weight_tons'=>16,'vehicle_type'=>'32ft Trailer','budget'=>20000])->assertCreated()->json('data');
        $loadId=$load['uuid']; $this->steps[]='Load posted using authenticated API';
        $app=$this->apply($provider,$vehicle,$loadId,19000);
        $otherApp=$this->apply($competitor,$otherVehicle,$loadId,18000);
        $this->steps[]='Two distinct truck owners applied with owned vehicles';
        $this->as($shipper);
        $this->postJson("/api/applications/{$app}/offers",['by_role'=>'owner','by_name'=>'Audit shipper','amount'=>17000])->assertCreated();
        $this->as($provider);
        $this->postJson("/api/loads/{$loadId}/applications/{$app}/accept")->assertOk();
        $this->assertSame('rejected',LoadApplication::where('uuid',$otherApp)->value('status'));
        $this->steps[]='Shipper counter-offer accepted by provider; competitor rejected';
        $booking=$this->postJson("/api/loads/{$loadId}/applications/{$app}/booking")->assertCreated()
            ->assertJsonPath('data.gross_freight','17000.00')->assertJsonPath('data.shipper_fee','1003.00')
            ->assertJsonPath('data.provider_fee','1003.00')->assertJsonPath('data.total_commission','2006.00')
            ->assertJsonPath('data.shipper_payable','18003.00')->assertJsonPath('data.provider_payout','15997.00')->json('data');
        $id=$booking['uuid']; $url="/api/marketplace-bookings/{$id}";
        $this->postJson("/api/loads/{$loadId}/applications/{$app}/booking")->assertOk()->assertJsonPath('data.uuid',$id);
        $this->assertSame(1,MarketplaceBooking::where('load_uuid',$loadId)->count());
        $this->postJson($url.'/workflow',['action'=>'start_trip'])->assertUnprocessable();
        foreach ([$shipper,$provider] as $party) {
            $this->as($party);
            $order=$this->postJson($url.'/token-orders')->assertCreated()->assertJsonPath('data.amount','1000.00')->json('data.uuid');
            $this->postJson($url.'/token-orders/'.$order.'/checkout')->assertOk();
            $this->getJson($url.'/token-orders/'.$order.'/status')->assertOk()->assertJsonPath('data.order.status','paid');
        }
        $this->getJson($url)->assertOk()->assertJsonPath('data.status','confirmed');
        $this->steps[]='Mock token checkout for both parties; confirmation gate passed';
        $this->action($provider,$url,['action'=>'assign_vehicle','mode'=>'Own Fleet','vehicle_reg_number'=>$vehicle->registration_number]);
        $this->action($provider,$url,['action'=>'assign_driver','driver_uuid'=>$driver->uuid]);
        $this->action($provider,$url,['action'=>'loading_completed']);
        $this->as($provider); $this->postJson($url.'/workflow',['action'=>'start_trip'])->assertUnprocessable();
        $this->as($shipper); $this->postJson($url.'/workflow',['action'=>'release_milestone','label'=>'Loading Advance'])->assertUnprocessable();
        $this->action($shipper,$url,['action'=>'confirm_loading']);
        if ($releaseAdvance) $this->action($shipper,$url,['action'=>'release_milestone','label'=>'Loading Advance']);
        $this->action($provider,$url,['action'=>'start_trip']);
        $this->steps[]='Vehicle/driver assignment; loading confirmation enforced; trip started with advance '.($releaseAdvance?'released':'not released');
        $this->as($shipper);
        $this->postJson($url.'/workflow',['action'=>'add_mid_trip_milestone','amount'=>10200.01,'trigger'=>'Over limit'])->assertUnprocessable();
        $mid=$this->action($shipper,$url,['action'=>'add_mid_trip_milestone','amount'=>2000,'trigger'=>'Isolated manual checkpoint']);
        $midId=$mid['workflow']['mid_trip_milestones'][0]['id'];
        $this->action($shipper,$url,['action'=>'release_milestone','label'=>'Mid-Trip Payment','milestone_id'=>$midId]);
        $this->steps[]='Mid-trip amount bounded, created and recorded released';
        $this->action($provider,$url,['action'=>'complete_trip']);
        $this->as($shipper); $this->postJson($url.'/settle')->assertUnprocessable();
        $this->as($provider);
        $this->post($url.'/pod',['pod_number'=>'AUDIT-'.Str::random(10),'received_by_name'=>'Isolated receiver',
            'file'=>UploadedFile::fake()->create('signed-audit-pod.pdf',15,'application/pdf')])->assertCreated()
            ->assertJsonPath('data.workflow.pod.status','pending_approval')->assertJsonMissingPath('data.workflow.pod.file_path');
        $this->as($competitor); $this->getJson($url)->assertForbidden(); $this->getJson($url.'/pod/download')->assertForbidden();
        $this->as($shipper); $this->get($url.'/pod/download')->assertOk();
        $this->postJson($url.'/pod/review',['decision'=>'approved'])->assertOk();
        $this->postJson($url.'/settle')->assertCreated()->assertJsonPath('data.status','pending');
        $this->steps[]='Delivery, private signed POD upload/download, unauthorized denial, approval and settlement preparation';
        $this->postJson($url.'/workflow',['action'=>'settle_final_payment','amount'=>8200])->assertUnprocessable();
        $final=$this->action($shipper,$url,['action'=>'settle_final_payment','amount'=>$finalDue,'reference'=>'ISOLATED-AUDIT-NO-MONEY-TRANSFER']);
        $this->assertSame('settled',$final['settlement']['status']);
        $this->assertEquals($finalFreight,$final['workflow']['final_payment']['freight_amount']);
        $this->assertEquals(1003,$final['workflow']['final_payment']['shipper_platform_fee']);
        $this->assertEquals($finalDue,$final['workflow']['final_payment']['total_amount']);
        $this->postJson($url.'/workflow',['action'=>'settle_final_payment','amount'=>$finalDue])->assertUnprocessable();
        $this->as($provider); $this->postJson($url.'/workflow',['action'=>'start_trip'])->assertUnprocessable();
        $this->steps[]='Incorrect final amount denied; final status recorded once; delivered trip locked';
        $notices=UserNotification::whereIn('user_uuid',[$shipper->uuid,$provider->uuid,$competitor->uuid])->get();
        foreach (['Offer accepted','Application declined','Vehicle assigned','Driver assigned','Loading confirmation requested',
            'Loading confirmed','Trip started','Mid-trip payment added','Payment milestone released','Trip completed',
            'Proof of delivery submitted','POD approved','Settlement created','Final settlement completed'] as $title) {
            $this->assertTrue($notices->contains('title',$title),'Missing bell: '.$title);
        }
        $this->steps[]='Expected participant bell notifications persisted';
        $evidence=['database'=>DB::connection()->getDatabaseName(),'fixture_rollback'=>true,'booking'=>$final,
            'load'=>$load,'steps'=>$this->steps,'money_transfer'=>false,'signup'=>'Not exercised; profile-complete transactional fixtures',
            'users'=>collect([$shipper,$provider,$competitor])->map(fn($u)=>$u->only(['uuid','email','user_type']))];
        $filename=$releaseAdvance?'lifecycle.json':'unreleased-advance.json';
        file_put_contents(__DIR__.'/../../.local-runtime/booking-audit/'.$filename,json_encode($evidence,JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES));
    }

    public function test_commission_threshold_and_tax_rounding(): void
    {
        foreach ([[10000,354,708],[10000.01,590,1180],[17000,1003,2006],[18500,1091.5,2183]] as [$freight,$side,$total]) {
            $result=app(CommissionService::class)->calculate($freight);
            $this->assertEquals($side,$result['shipper_fee']);
            $this->assertEquals($side,$result['provider_fee']);
            $this->assertEquals($total,$result['total_commission']);
            $this->assertEquals($freight+$side,$result['shipper_payable']);
            $this->assertEquals($freight-$side,$result['provider_payout']);
        }
    }

    private function user(string $type): User
    {
        $u=User::create(['first_name'=>'Booking Audit','last_name'=>'Isolated','email'=>'booking-audit-'.Str::uuid().'@example.test',
            'phone'=>'9'.random_int(100000000,999999999),'user_type'=>$type,'status'=>'active','is_verified'=>true,'password'=>'IsolatedAudit@2026!']);
        $u=User::where('uuid',$u->uuid)->firstOrFail();
        $u->forceFill(['profile_completed_at'=>now(),'email_verified_at'=>now()])->save();
        return $u;
    }

    private function vehicle(User $owner): MarketplaceVehicle
    {
        return MarketplaceVehicle::create(['uuid'=>(string)Str::uuid(),'owner_uuid'=>$owner->uuid,
            'registration_number'=>'AUDIT'.Str::upper(Str::random(10)),'vehicle_type'=>'32ft Trailer','make'=>'Tata',
            'model'=>'Audit','capacity_tons'=>20,'status'=>'available','created_by'=>$owner->uuid]);
    }

    private function as(User $u): void
    {
        Auth::forgetGuards(); $this->withToken(app(JwtTokenService::class)->generateAccessToken($u));
    }

    private function apply(User $u, MarketplaceVehicle $vehicle, string $load, float $amount): string
    {
        $this->as($u);
        return $this->postJson("/api/loads/{$load}/applications",['applicant_role'=>'truck-owner','applicant_name'=>'Isolated audit provider',
            'vehicle_reg_number'=>$vehicle->registration_number,'vehicle_type'=>$vehicle->vehicle_type,
            'availability'=>'Today','quoted_amount'=>$amount])->assertCreated()->json('data.uuid');
    }

    private function action(User $u, string $url, array $payload): array
    {
        $this->as($u); return $this->postJson($url.'/workflow',$payload)->assertOk()->json('data');
    }
}
