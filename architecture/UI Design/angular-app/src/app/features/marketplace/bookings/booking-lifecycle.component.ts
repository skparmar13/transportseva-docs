import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { LanguageService } from '../../../core/i18n';
import { BookingLifecycle } from '../../../core/models/booking-lifecycle.model';
import { formatDateTime } from '../../../core/utils/date-format';

@Component({ selector: 'app-booking-lifecycle', standalone: true, templateUrl: './booking-lifecycle.component.html', styleUrl: './booking-lifecycle.component.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class BookingLifecycleComponent {
  readonly value = input<BookingLifecycle | undefined>();
  private readonly language = inject(LanguageService);
  readonly date = formatDateTime;
  readonly money = (v: number | null) => v === null ? this.tr('Amount not recorded', 'राशि दर्ज नहीं है') : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(v);
  tr(en: string, hi: string) { return this.language.lang() === 'hi' ? hi : en; }
  label(status: string): string {
    const labels: Record<string, [string, string]> = {
      awaiting_agreement: ['Awaiting agreement', 'समझौता लंबित'], awaiting_tokens: ['Awaiting booking tokens', 'बुकिंग टोकन लंबित'],
      confirmed: ['Confirmed', 'पुष्ट'], vehicle_assigned: ['Vehicle assigned', 'वाहन आवंटित'], driver_assigned: ['Driver assigned', 'चालक आवंटित'],
      awaiting_loading_confirmation: ['Loading confirmation pending', 'लोडिंग पुष्टि लंबित'], loading_confirmed: ['Loading confirmed', 'लोडिंग पुष्ट'],
      in_transit: ['In transit', 'यात्रा जारी'], delivered: ['Delivered', 'डिलीवरी पूरी'], cancelled: ['Cancelled', 'रद्द'],
      not_uploaded: ['Not uploaded', 'अपलोड नहीं हुआ'], pending_approval: ['Approval pending', 'स्वीकृति लंबित'], approved: ['Approved', 'स्वीकृत'], rejected: ['Correction required', 'सुधार आवश्यक'],
      unconfigured: ['Instructions unavailable', 'निर्देश उपलब्ध नहीं'], needs_review: ['Reconciliation required', 'मिलान आवश्यक'],
      not_recorded: ['No confirmed receipts', 'पुष्ट प्राप्ति नहीं'], partially_confirmed: ['Partially confirmed', 'आंशिक प्राप्ति पुष्ट'],
      awaiting_confirmation: ['Recipient confirmation pending', 'प्राप्तकर्ता की पुष्टि लंबित'], disputed: ['Receipt disputed', 'प्राप्ति विवादित'], fully_confirmed: ['Freight fully confirmed', 'पूरा भाड़ा पुष्ट'],
      collection_not_recorded: ['Collection not recorded', 'वसूली दर्ज नहीं'], no_fee: ['No fee', 'कोई शुल्क नहीं'],
      paid: ['Paid', 'भुगतान किया'], not_ordered: ['No token order', 'टोकन ऑर्डर नहीं'], awaiting_payment: ['Payment pending', 'भुगतान लंबित'],
      refund_pending: ['Refund pending', 'रिफंड लंबित'], refunded: ['Refund recorded', 'रिफंड दर्ज'], forfeiture_pending: ['Forfeiture pending', 'जब्ती लंबित'], forfeited: ['Forfeiture recorded', 'जब्ती दर्ज'],
      refund: ['Refund approved; execution separate', 'रिफंड स्वीकृत; प्रक्रिया अलग'], forfeit: ['Forfeiture approved; execution separate', 'जब्ती स्वीकृत; प्रक्रिया अलग'],
      waive: ['Fee waiver approved; accounting separate', 'शुल्क छूट स्वीकृत; लेखांकन अलग'], due: ['Fee due decision recorded', 'देय शुल्क का निर्णय दर्ज'],
      no_action: ['No action approved', 'कोई कार्रवाई स्वीकृत नहीं'], pending: ['Decision pending', 'निर्णय लंबित'],
      retain: ['Token retention approved', 'टोकन बनाए रखने का निर्णय स्वीकृत'], charge: ['Fee charge approved; collection not recorded', 'शुल्क लेना स्वीकृत; वसूली दर्ज नहीं'],
    };
    const pair = labels[status]; return pair ? this.tr(...pair) : this.tr('Status not verified', 'स्थिति सत्यापित नहीं');
  }
}
