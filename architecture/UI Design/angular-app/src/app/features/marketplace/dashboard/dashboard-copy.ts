// Feature-local translations stay in the lazy dashboard bundle, not the
// already large application bootstrap dictionary.
const EN = {
  refresh: 'Refresh dashboard', loading: 'Loading your dashboard…', error: 'Dashboard data could not be loaded.',
  retry: 'Try again', errorHint: 'Please try again or refresh the page.', updated: 'Updated',
  loads: 'Total loads posted', pending: 'Pending applications', inTransit: 'In-transit bookings', delivered: 'Delivered bookings',
  vehicles: 'My vehicles', onTrip: 'Vehicles on trip', available: 'Available vehicles',
  emptyLoads: 'No loads posted yet.', emptyVehicles: 'No vehicles registered yet.',
  scope: 'All-time totals for your account. Recent lists show up to 6 records.',
  providerSubtitle: 'Your registered fleet and marketplace applications.',
  registeredVehicles: 'Recently registered vehicles', registered: 'Registered on', budget: 'Budget', makeModel: 'Make / model',
  postLoad: 'Post a Load', myLoads: 'My Loads', applications: 'Applications Received', bookings: 'Bookings',
  loadBoard: 'Browse Load Board', myVehicles: 'My Vehicles', myDrivers: 'My Drivers', details: 'View details',
  unknown: 'Not available',
  statuses: { open: 'Open', applications_received: 'Applications received', booked: 'Booked', in_transit: 'In transit',
    delivered: 'Delivered', completed: 'Delivered', cancelled: 'Cancelled', available: 'Available', reserved: 'Reserved',
    on_trip: 'On trip', maintenance: 'Maintenance', inactive: 'Offline' } as Record<string, string>,
};
const HI: typeof EN = {
  refresh: 'डैशबोर्ड रीफ़्रेश करें', loading: 'आपका डैशबोर्ड लोड हो रहा है…', error: 'डैशबोर्ड का डेटा लोड नहीं हो सका।',
  retry: 'फिर कोशिश करें', errorHint: 'कृपया फिर कोशिश करें या पेज रीफ़्रेश करें।', updated: 'अपडेट किया गया',
  loads: 'कुल पोस्ट किए गए लोड', pending: 'लंबित आवेदन', inTransit: 'रास्ते में बुकिंग', delivered: 'डिलीवर की गई बुकिंग',
  vehicles: 'मेरे वाहन', onTrip: 'ट्रिप पर वाहन', available: 'उपलब्ध वाहन',
  emptyLoads: 'अभी कोई लोड पोस्ट नहीं किया गया है।', emptyVehicles: 'अभी कोई वाहन पंजीकृत नहीं है।',
  scope: 'आपके खाते के अब तक के कुल आँकड़े। हाल की सूची में अधिकतम 6 रिकॉर्ड हैं।',
  providerSubtitle: 'आपके पंजीकृत वाहन और मार्केटप्लेस आवेदन।',
  registeredVehicles: 'हाल में पंजीकृत वाहन', registered: 'पंजीकरण की तिथि', budget: 'बजट', makeModel: 'निर्माता / मॉडल',
  postLoad: 'लोड पोस्ट करें', myLoads: 'मेरे लोड', applications: 'प्राप्त आवेदन', bookings: 'बुकिंग',
  loadBoard: 'लोड बोर्ड देखें', myVehicles: 'मेरे वाहन', myDrivers: 'मेरे ड्राइवर', details: 'विवरण देखें',
  unknown: 'उपलब्ध नहीं है',
  statuses: { open: 'खुला', applications_received: 'आवेदन प्राप्त', booked: 'बुक किया गया', in_transit: 'रास्ते में',
    delivered: 'डिलीवर किया गया', completed: 'डिलीवर किया गया', cancelled: 'रद्द', available: 'उपलब्ध', reserved: 'आरक्षित',
    on_trip: 'ट्रिप पर', maintenance: 'रखरखाव', inactive: 'ऑफ़लाइन' },
};
export function dashboardCopy(language: string): typeof EN { return language === 'hi' ? HI : EN; }

export function dashboardStatusClass(status: string): string {
  if (['cancelled', 'inactive'].includes(status)) return 'status-cancelled';
  if (['completed', 'delivered'].includes(status)) return 'status-delivered';
  if (['in_transit', 'on_trip'].includes(status)) return 'status-transit';
  if (status === 'maintenance') return 'status-overdue';
  return 'status-pending';
}
