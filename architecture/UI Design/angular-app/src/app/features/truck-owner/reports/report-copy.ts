import { REPORT_COPY } from '../../shipper/reports/report-copy';
export const OWNER_REPORT_COPY = {
  en: {
    ...REPORT_COPY.en, desc: 'Your applications sent and booked trips.',
    boundary: 'Only your own marketplace records appear here.',
    basis: 'Dates select when each application or booking was created, in IST. Statuses are current. Linked bookings cover the lifetime of the selected applications.',
    applications: 'Applications sent', applicationsTotal: 'Applications sent', pendingTotal: 'Pending applications',
    withBooking: 'Applications with a non-cancelled booking', appliedAt: 'Applied', proposedVehicle: 'Proposed vehicle',
    applicationStates: { pending: 'Pending', negotiating: 'Negotiating', accepted: 'Accepted', rejected: 'Rejected', withdrawn: 'Withdrawn', other: 'Other recorded state' },
    exportHint: 'Exports include every matching row in the selected table, using the applied filters and IST dates.',
  },
  hi: {
    ...REPORT_COPY.hi, desc: 'आपके भेजे आवेदन और बुक की गई यात्राएँ।',
    boundary: 'यहाँ केवल आपके अपने मार्केटप्लेस रिकॉर्ड दिखाई देते हैं।',
    basis: 'तिथियाँ प्रत्येक आवेदन या बुकिंग के बनने की तारीख को IST में चुनती हैं। स्थितियाँ वर्तमान हैं। जुड़ी बुकिंग चयनित आवेदनों के पूरे जीवनकाल की हैं।',
    applications: 'भेजे गए आवेदन', applicationsTotal: 'भेजे गए आवेदन', pendingTotal: 'लंबित आवेदन',
    withBooking: 'गैर-रद्द बुकिंग वाले आवेदन', appliedAt: 'आवेदन किया', proposedVehicle: 'प्रस्तावित वाहन',
    applicationStates: { pending: 'लंबित', negotiating: 'बातचीत जारी', accepted: 'स्वीकृत', rejected: 'अस्वीकृत', withdrawn: 'वापस लिया', other: 'अन्य दर्ज स्थिति' },
    exportHint: 'निर्यात में लागू फ़िल्टर के अनुसार चयनित तालिका के सभी मिलते रिकॉर्ड और IST तिथियाँ शामिल हैं।',
  },
} as const;
