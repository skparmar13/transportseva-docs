import { LanguageCode } from '../../../core/i18n/language.service';
import { TRIP_COPY } from './trip-copy';

/** Shared trip pages; role routing and API providers are set by guarded routes. */
export function tripCopy(language: LanguageCode, truckOwner: boolean) {
  const copy = TRIP_COPY[language];
  if (!truckOwner) return copy;
  return { ...copy, ...(language === 'hi' ? {
    title: 'मेरी यात्राएँ', hint: 'आपकी बुकिंग और यात्राओं के वास्तविक रिकॉर्ड।',
    back: 'यात्राओं पर वापस', provider: 'शिपर',
    booking: 'बुकिंग / POD कार्य खोलें',
    detailFailed: 'यह यात्रा उपलब्ध नहीं है या आपके ट्रक मालिक खाते की नहीं है।',
    podHint: 'इस बुकिंग में हस्ताक्षरित POD अपलोड करें या सुधारें। शिपर वहीं इसकी समीक्षा करता है।',
    lifecycleHint: 'यात्रा अपडेट और POD के लिए जुड़ी बुकिंग खोलें।',
  } : {
    title: 'My Trips', hint: 'Your actual bookings and operational trip records.',
    back: 'Back to Trips', provider: 'Shipper', booking: 'Open booking / POD actions',
    detailFailed: 'This trip is unavailable or does not belong to your truck owner account.',
    podHint: 'Upload or replace the signed POD in this booking. The shipper reviews it there.',
    lifecycleHint: 'Manage trip updates and POD in the linked booking.',
  }) };
}
