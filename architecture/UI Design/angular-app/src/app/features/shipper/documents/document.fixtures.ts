import { ShipperDocuments } from '../../../core/api/api-shipper-document.service';
export const documentUuid = '5c18b398-8a75-4017-9ecf-e268282a4852';
export const documentFixture: ShipperDocuments & { page: number; lastPage: number; matching: number } = {
  pods: [{ booking_uuid: documentUuid, booking_reference: 'TS-QA-DOCUMENT', load_uuid: documentUuid, load_reference: 'LD-QA-DOC',
    pickup_city: 'Delhi', drop_city: 'Jaipur', status: 'approved', number: 'POD-ORIGINAL',
    received_by: 'Stored Receiver', file_name: 'original.pdf', uploaded_at: '2026-10-30T10:00:00Z', reviewed_at: null,
    review_note: '<script>escaped review note</script>', download_available: true }],
  kyc: { uuid: '8fbee589-49f2-4a3f-bf8d-7e2013614e02', business_name: 'Own Legal Business', status: 'approved',
    file_name: 'identity.pdf', submitted_at: '2026-10-30T10:00:00Z', reviewed_at: null, review_note: null, download_available: true },
  totals: { total: 9, approved: 7, pending_approval: 1, rejected: 1, other: 0 },
  generated_at: '2026-11-01T10:00:00Z', page: 1, lastPage: 1, matching: 1,
};
