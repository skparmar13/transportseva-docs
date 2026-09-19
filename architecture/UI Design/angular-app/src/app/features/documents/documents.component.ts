import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { FleetMockService } from '../../core/services/fleet-mock.service';
import { DriverMockService } from '../../core/services/driver-mock.service';
import { TripMockService } from '../../core/services/trip-mock.service';
import { VehicleDocument } from '../../core/models/fleet.model';
import { DriverDocument } from '../../core/models/driver.model';

type DocumentsTab = 'vehicle' | 'driver' | 'pod';

interface VehicleDocRow {
  ownerRef: string;
  type: string;
  documentNumber: string;
  expiryDate: string;
  status: string;
  fileName?: string;
}

interface DriverDocRow {
  ownerRef: string;
  type: string;
  documentNumber: string;
  expiryDate: string;
  status: string;
  fileName?: string;
}

interface PodDocRow {
  tripId: string;
  route: string;
  podNumber: string;
  receivedBy: string;
  uploadedAt: string;
  fileRef?: string;
}

const STATUS_CLASS: Record<string, string> = {
  Valid: 'status-delivered',
  'Expiring Soon': 'status-pending',
  Expired: 'status-cancelled',
  'Not Uploaded': 'status-cancelled',
};

/**
 * Documents — Module 11. A consolidated compliance hub over data
 * already captured in Fleet (Module 4), Drivers (Module 5) and Trips
 * (Module 7) — RC/Insurance/Permit/Fitness/PUC per vehicle, License/
 * Aadhaar/Police Verification/Medical per driver, and POD per trip.
 * Intentionally reads from those existing mock services rather than
 * duplicating document data in a new store.
 */
@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './documents.component.html',
})
export class DocumentsComponent {
  private readonly fleet = inject(FleetMockService);
  private readonly drivers = inject(DriverMockService);
  private readonly trips = inject(TripMockService);

  protected readonly statusClass = STATUS_CLASS;
  protected readonly activeTab = signal<DocumentsTab>('vehicle');

  protected setTab(tab: DocumentsTab): void {
    this.activeTab.set(tab);
  }

  protected uploadVehicle(event: Event, doc: VehicleDocRow): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.fleet.attachDocument(doc.ownerRef, doc.type as VehicleDocument['type'], file.name);
    input.value = '';
  }

  protected uploadDriver(event: Event, doc: DriverDocRow): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.drivers.attachDocument(doc.ownerRef, doc.type as DriverDocument['type'], file.name);
    input.value = '';
  }

  protected downloadPod(doc: PodDocRow): void {
    const fileRef = doc.fileRef ?? doc.podNumber ?? doc.tripId;
    const content = [`Proof of delivery: ${fileRef}`, `Trip: ${doc.tripId}`, `Route: ${doc.route}`, `Received by: ${doc.receivedBy}`, `Uploaded: ${doc.uploadedAt}`].join('\r\n');
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileRef}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  protected readonly vehicleDocs = computed<VehicleDocRow[]>(() =>
    this.fleet.vehicles().flatMap((v) =>
      v.documents.map((d) => ({
        ownerRef: v.regNumber,
        type: d.type,
        documentNumber: d.documentNumber ?? '—',
        expiryDate: d.expiryDate ?? '—',
        status: d.status,
        fileName: d.fileName,
      })),
    ),
  );

  protected readonly driverDocs = computed<DriverDocRow[]>(() =>
    this.drivers.drivers().flatMap((driver) =>
      driver.documents.map((d) => ({
        ownerRef: driver.name,
        type: d.type,
        documentNumber: d.documentNumber ?? '—',
        expiryDate: d.expiryDate ?? '—',
        status: d.status,
        fileName: d.fileName,
      })),
    ),
  );

  protected readonly podDocs = computed<PodDocRow[]>(() =>
    this.trips
      .trips()
      .filter((t) => t.pod.uploaded)
      .map((t) => ({
        tripId: t.tripId,
        route: `${t.pickupCity} \u2192 ${t.dropCity}`,
        podNumber: t.pod.podNumber ?? '—',
        receivedBy: t.pod.receivedByName ?? '—',
        uploadedAt: t.pod.uploadedAt ?? '—',
      })),
  );

  protected readonly expiredCount = computed(
    () =>
      this.vehicleDocs().filter((d) => d.status === 'Expired').length +
      this.driverDocs().filter((d) => d.status === 'Expired').length,
  );

  protected readonly expiringSoonCount = computed(
    () =>
      this.vehicleDocs().filter((d) => d.status === 'Expiring Soon').length +
      this.driverDocs().filter((d) => d.status === 'Expiring Soon').length,
  );

  protected readonly validCount = computed(
    () =>
      this.vehicleDocs().filter((d) => d.status === 'Valid').length +
      this.driverDocs().filter((d) => d.status === 'Valid').length,
  );

  protected readonly totalDocsCount = computed(() => this.vehicleDocs().length + this.driverDocs().length);
}
