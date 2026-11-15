import { LanguageCode } from '../../../core/i18n/language.service';
import { DOCUMENT_COPY } from './document-copy';

export function documentCopy(language: LanguageCode, truckOwner: boolean, transporter = false) {
  const copy = DOCUMENT_COPY[language];
  if (transporter) return { ...copy, ...(language === 'hi' ? {
    desc: 'लोड स्वामी या सेवा प्रदाता के रूप में आपकी बुकिंग के POD और आपका अपना KYC दस्तावेज़।',
    boundary: 'अपनी भूमिका के अनुसार जुड़ी बुकिंग में POD अपलोड, सुधार या समीक्षा करें। अपना व्यवसाय KYC में प्रबंधित करें।',
    bookingLink: 'बुकिंग / POD कार्य खोलें',
  } : {
    desc: 'PODs for bookings where you are load owner or provider, and your own KYC document.',
    boundary: 'Upload, correct or review POD in the linked booking according to your role. Manage your own business verification in KYC.',
    bookingLink: 'Open booking / POD actions',
  }) };
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
