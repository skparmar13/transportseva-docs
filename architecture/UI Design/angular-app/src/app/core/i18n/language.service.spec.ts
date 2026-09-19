import { TestBed } from '@angular/core/testing';
import { LanguageService } from './language.service';

describe('LanguageService status labels', () => {
  const statusKeys = [
    'status.pending', 'status.completed', 'status.paid', 'status.open', 'status.applications',
    'status.applicationsReceived', 'status.booked', 'status.inTransit', 'status.delivered', 'status.cancelled',
    'status.negotiating', 'status.accepted', 'status.rejected', 'status.withdrawn', 'status.awaitingDeposit',
    'status.awaitingDeposits', 'status.offerAccepted', 'status.confirmed', 'status.vehicleAssigned',
    'status.driverAssigned', 'status.loadingCompleted', 'status.tripStarted', 'status.settlementPending',
    'status.released', 'status.available', 'status.onTrip', 'status.offDuty', 'status.suspended',
    'status.idle', 'status.maintenance', 'status.offline', 'status.planned', 'status.assigned', 'status.inProgress',
  ];

  beforeEach(() => TestBed.configureTestingModule({}));

  it('resolves every normalized status key in English and Hindi', () => {
    const language = TestBed.inject(LanguageService);
    for (const code of ['en', 'hi'] as const) {
      language.setLang(code);
      for (const key of statusKeys) expect(language.translate(key)).not.toBe(key);
    }
  });
});
