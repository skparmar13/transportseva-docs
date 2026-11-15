import { LanguageCode } from '../../../core/i18n/language.service';
import { TRIP_COPY } from './trip-copy';

/** Shared trip pages; role routing and API providers are set by guarded routes. */
export function tripCopy(language: LanguageCode, truckOwner: boolean, transporter = false, provider = false) {
  const copy = TRIP_COPY[language];
  if (transporter) return { ...copy, ...(language === 'hi' ? {
    title: 'मेरी यात्राएँ', hint: 'लोड स्वामी या सेवा प्रदाता के रूप में आपकी वास्तविक बुकिंग और यात्राएँ।',
    back: 'यात्राओं पर वापस', provider: provider ? 'लोड स्वामी' : 'सेवा प्रदाता',
    booking: 'बुकिंग / POD कार्य खोलें', detailFailed: 'यह यात्रा उपलब्ध नहीं है या आपका ट्रांसपोर्टर खाता इस बुकिंग में शामिल नहीं है।',
    podHint: provider ? 'जुड़ी बुकिंग में POD अपलोड करें या सुधारें। लोड स्वामी इसकी समीक्षा करता है।' : 'जुड़ी बुकिंग में सेवा प्रदाता का POD देखें और समीक्षा करें।',
    lifecycleHint: 'यात्रा अपडेट और POD के लिए जुड़ी बुकिंग खोलें।',
  } : {
    title: 'My Trips', hint: 'Your actual bookings as load owner or transport provider.', back: 'Back to Trips',
    provider: provider ? 'Load owner' : 'Provider', booking: 'Open booking / POD actions',
    detailFailed: 'This trip is unavailable or your transporter account is not a party to this booking.',
    podHint: provider ? 'Upload or replace POD in the linked booking. The load owner reviews it there.' : 'Review the provider’s POD in the linked booking.',
    lifecycleHint: 'Manage trip updates and POD in the linked booking.',
  }) };
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
