import { OWNER_REPORT_COPY } from '../../truck-owner/reports/report-copy';
import { REPORT_COPY } from '../../shipper/reports/report-copy';
export const TRANSPORTER_REPORT_COPY = {
  en: {
    ...OWNER_REPORT_COPY.en,
    desc: 'Your posted loads, applications sent and bookings as load owner or provider.',
    boundary: 'Only your own posted loads, sent applications and participating bookings appear here.',
    basis: 'Dates select each load, application or booking creation date in IST. Statuses are current. Received application counts cover the lifetime of the selected posted loads; linked bookings cover the lifetime of selected sent applications.',
    receivedApps: 'Applications received on selected loads', loadsWithBooking: REPORT_COPY.en.withBooking,
  },
  hi: {
    ...OWNER_REPORT_COPY.hi,
    desc: 'आपके पोस्ट किए लोड, भेजे आवेदन और लोड स्वामी या सेवा प्रदाता के रूप में बुकिंग।',
    boundary: 'यहाँ केवल आपके पोस्ट किए लोड, भेजे आवेदन और आपकी भागीदारी वाली बुकिंग हैं।',
    basis: 'तिथियाँ लोड, आवेदन या बुकिंग के बनने की तारीख को IST में चुनती हैं। स्थितियाँ वर्तमान हैं। प्राप्त आवेदन चयनित लोड के पूरे जीवनकाल के हैं; जुड़ी बुकिंग चयनित भेजे आवेदनों के पूरे जीवनकाल की हैं।',
    receivedApps: 'चयनित लोड पर प्राप्त आवेदन', loadsWithBooking: REPORT_COPY.hi.withBooking,
  },
} as const;
