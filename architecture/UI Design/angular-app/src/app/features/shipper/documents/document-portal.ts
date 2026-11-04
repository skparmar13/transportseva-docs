import { LanguageCode } from '../../../core/i18n/language.service';
import { DOCUMENT_COPY } from './document-copy';

export function documentCopy(language: LanguageCode, truckOwner: boolean) {
  const copy = DOCUMENT_COPY[language];
  if (!truckOwner) return copy;
  return { ...copy, ...(language === 'hi' ? {
    desc: 'आपकी बुकिंग के POD और आपका व्यवसाय KYC दस्तावेज़।',
    boundary: 'POD अपलोड और सुधार बुकिंग में करें। व्यवसाय सत्यापन KYC में प्रबंधित करें।',
    bookingLink: 'बुकिंग / POD कार्य खोलें',
  } : {
    desc: 'Your booking POD records and your own business KYC document.',
    boundary: 'Upload or correct PODs in Bookings. Manage business verification in KYC.',
    bookingLink: 'Open booking / POD actions',
  }) };
}
