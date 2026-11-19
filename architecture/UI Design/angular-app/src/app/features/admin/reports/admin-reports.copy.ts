const en = {
  title: 'Operational reports', description: 'Saved marketplace records grouped by creation day in IST and current recorded status.',
  basis: 'Each dataset uses its own creation date. Statuses are current; these are not historical status snapshots. Applications on deleted loads are excluded.',
  counts: 'Summary counts cover the full applied period. The status filter and pagination apply to the grouped table and its export.',
  loads: 'Loads', applications: 'Applications', bookings: 'Bookings', from: 'Created from (IST)', to: 'Created through (IST)', status: 'Table status', all: 'All statuses',
  apply: 'Apply filters', refresh: 'Refresh report', reset: 'Clear filters', loading: 'Loading operational report…', exporting: 'Preparing CSV…',
  export: 'Export matching groups (CSV)', exportHint: 'CSV contains all matching date/status groups, not just this page. Maximum 10,000 grouped rows. Counts only; no participant details.',
  retry: 'Try again', failed: 'The report could not be loaded. Please try again.', denied: 'Your staff account is not authorized to view these operational reports.',
  invalid: 'Select valid dates from 1900 through 2100. From must not be after Through.', exportFailed: 'CSV could not be prepared. Retry or narrow the applied period/status; the limit is 10,000 grouped rows.',
  total: 'Records in applied period', current: 'Current status breakdown', applied: 'Applied period', allDates: 'All dates', appliedStatus: 'Applied table status', generated: 'Updated',
  day: 'Creation day (IST)', state: 'Current recorded status', records: 'Records', missing: 'Not recorded', empty: 'No groups match the applied period and status.',
  groups: 'Matching groups', page: 'Page', previous: 'Previous', next: 'Next',
};
const hi: typeof en = {
  title: 'संचालन रिपोर्ट', description: 'सहेजे गए मार्केटप्लेस रिकॉर्ड, IST में निर्माण के दिन और वर्तमान स्थिति के अनुसार।',
  basis: 'हर डेटासेट की अपनी निर्माण तिथि लागू होती है। स्थितियाँ वर्तमान हैं, ऐतिहासिक स्थिति नहीं। हटाए गए लोड के आवेदन शामिल नहीं हैं।',
  counts: 'सारांश पूरी लागू अवधि का है। स्थिति फ़िल्टर और पृष्ठ केवल समूह तालिका और उसके निर्यात पर लागू होते हैं।',
  loads: 'लोड', applications: 'आवेदन', bookings: 'बुकिंग', from: 'निर्माण तिथि से (IST)', to: 'निर्माण तिथि तक (IST)', status: 'तालिका की स्थिति', all: 'सभी स्थितियाँ',
  apply: 'फ़िल्टर लगाएँ', refresh: 'रिपोर्ट रीफ़्रेश करें', reset: 'फ़िल्टर हटाएँ', loading: 'संचालन रिपोर्ट लोड हो रही है…', exporting: 'CSV तैयार हो रही है…',
  export: 'मिलते समूहों की CSV डाउनलोड करें', exportHint: 'CSV में सभी मिलते दिन/स्थिति समूह होंगे, केवल यह पृष्ठ नहीं। अधिकतम 10,000 समूह। केवल गिनती, प्रतिभागियों का विवरण नहीं।',
  retry: 'फिर से प्रयास करें', failed: 'रिपोर्ट लोड नहीं हो सकी। कृपया फिर से प्रयास करें।', denied: 'आपके स्टाफ खाते को ये संचालन रिपोर्ट देखने की अनुमति नहीं है।',
  invalid: '1900 से 2100 के बीच सही तिथियाँ चुनें। आरंभ तिथि अंतिम तिथि के बाद नहीं हो सकती।', exportFailed: 'CSV तैयार नहीं हो सकी। फिर से प्रयास करें या लागू अवधि/स्थिति घटाएँ। सीमा 10,000 समूह है।',
  total: 'लागू अवधि के रिकॉर्ड', current: 'वर्तमान स्थिति का विवरण', applied: 'लागू अवधि', allDates: 'सभी तिथियाँ', appliedStatus: 'लागू तालिका स्थिति', generated: 'अपडेट किया गया',
  day: 'निर्माण का दिन (IST)', state: 'वर्तमान दर्ज स्थिति', records: 'रिकॉर्ड', missing: 'दर्ज नहीं', empty: 'लागू अवधि और स्थिति से मेल खाने वाले समूह नहीं मिले।',
  groups: 'मिलते समूह', page: 'पृष्ठ', previous: 'पिछला', next: 'अगला',
};
const statuses: Record<string, [string, string]> = {
  open: ['Open', 'खुला'], applications_received: ['Applications received', 'आवेदन मिले'], booked: ['Booked', 'बुक किया गया'], closed: ['Closed', 'बंद'], cancelled: ['Cancelled', 'रद्द'], other: ['Other recorded state', 'अन्य दर्ज स्थिति'],
  pending: ['Pending', 'लंबित'], negotiating: ['Negotiating', 'बातचीत जारी'], accepted: ['Accepted', 'स्वीकृत'], rejected: ['Rejected', 'अस्वीकृत'], withdrawn: ['Withdrawn', 'वापस लिया गया'],
  awaiting_deposit: ['Awaiting confirmation', 'पुष्टि लंबित'], confirmed: ['Confirmed', 'पुष्टि हुई'], vehicle_assigned: ['Vehicle assigned', 'वाहन सौंपा गया'], driver_assigned: ['Driver assigned', 'ड्राइवर सौंपा गया'],
  loading_completed: ['Loading completed', 'लोडिंग पूर्ण'], in_transit: ['In transit', 'रास्ते में'], completed: ['Delivery recorded', 'डिलीवरी दर्ज'], settlement_pending: ['Settlement pending', 'निपटान लंबित'], settled: ['Settled', 'निपटान दर्ज'], disputed: ['Disputed / paused', 'विवाद / रुका हुआ'],
};
export const adminReportCopy = (language: string) => language === 'hi' ? hi : en;
export const adminReportStatus = (status: string, language: string) => statuses[status]?.[language === 'hi' ? 1 : 0] ?? statuses['other'][language === 'hi' ? 1 : 0];
