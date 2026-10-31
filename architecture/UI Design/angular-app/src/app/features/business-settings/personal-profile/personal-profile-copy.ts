import { LanguageCode } from '../../../core/i18n/language.service';
const en = {
  title: 'My profile', subtitle: 'Your identity, optional signup details and communication preferences. Company tenancy, staff and billing are managed separately.',
  gate: 'Complete your profile and verify your login email before using the portal.', loading: 'Loading your profile…', loadError: 'Your profile could not be loaded.', retry: 'Retry',
  first_name: 'First name', last_name: 'Last name', email: 'Login email', designation: 'Designation', address: 'Address', city: 'City', pincode: 'Pincode', optional: 'optional',
  phone: 'Signup phone', password: 'Create password', confirmation: 'Confirm password', current: 'Current password (required to change login email)',
  passwordHint: 'Use 8–128 characters with uppercase, lowercase, a number and a symbol.', mismatch: 'Passwords do not match.', required: 'This field is required.', invalidEmail: 'Enter a valid email address.', invalidPin: 'Enter a valid six-digit Indian pincode.',
  emailUpdates: 'Email updates', smsUpdates: 'SMS updates', preferenceHint: 'Optional communication preferences do not disable security verification or in-app notifications.',
  save: 'Save profile', saving: 'Saving…', saved: 'Profile saved.', latest: 'Load latest profile (discards unsaved edits)',
  verification: 'Login email verification', verified: 'Email verified', unverified: 'Email verification required', saveFirst: 'Save your profile with your login email first.',
  send: 'Send verification code', sending: 'Sending…', resend: 'Resend code', code: 'Six-digit verification code', verify: 'Verify email', verifying: 'Verifying…',
  sandbox: 'Local development only: no email was sent. Test code:', queued: 'Your verification email is queued. Check your inbox; the code expires in 10 minutes.', sent: 'A code was sent to your saved login email. It expires in 10 minutes. Wait 60 seconds before resending.',
  continue: 'Continue to dashboard', ready: 'Your profile is complete and your email is verified.',
};
const hi: typeof en = {
  title: 'मेरी प्रोफ़ाइल', subtitle: 'आपकी पहचान, वैकल्पिक पंजीकरण जानकारी और संचार प्राथमिकताएँ। कंपनी, स्टाफ और बिलिंग अलग से प्रबंधित हैं।',
  gate: 'पोर्टल उपयोग करने से पहले प्रोफ़ाइल पूरी करें और लॉगिन ईमेल सत्यापित करें।', loading: 'प्रोफ़ाइल लोड हो रही है…', loadError: 'प्रोफ़ाइल लोड नहीं हो सकी।', retry: 'पुनः प्रयास',
  first_name: 'पहला नाम', last_name: 'उपनाम', email: 'लॉगिन ईमेल', designation: 'पद', address: 'पता', city: 'शहर', pincode: 'पिनकोड', optional: 'वैकल्पिक',
  phone: 'पंजीकरण फ़ोन', password: 'पासवर्ड बनाएँ', confirmation: 'पासवर्ड की पुष्टि करें', current: 'वर्तमान पासवर्ड (लॉगिन ईमेल बदलने के लिए आवश्यक)',
  passwordHint: '8–128 अक्षरों में बड़े/छोटे अक्षर, अंक और प्रतीक रखें।', mismatch: 'पासवर्ड मेल नहीं खाते।', required: 'यह फ़ील्ड आवश्यक है।', invalidEmail: 'मान्य ईमेल दर्ज करें।', invalidPin: 'छह अंकों का मान्य भारतीय पिनकोड दर्ज करें।',
  emailUpdates: 'ईमेल अपडेट', smsUpdates: 'SMS अपडेट', preferenceHint: 'वैकल्पिक प्राथमिकताएँ सुरक्षा सत्यापन या इन-ऐप सूचनाएँ बंद नहीं करतीं।',
  save: 'प्रोफ़ाइल सहेजें', saving: 'सहेजा जा रहा है…', saved: 'प्रोफ़ाइल सहेजी गई।', latest: 'नवीनतम प्रोफ़ाइल लोड करें (बिना सहेजे बदलाव हटेंगे)',
  verification: 'लॉगिन ईमेल सत्यापन', verified: 'ईमेल सत्यापित', unverified: 'ईमेल सत्यापन आवश्यक', saveFirst: 'पहले लॉगिन ईमेल के साथ प्रोफ़ाइल सहेजें।',
  send: 'सत्यापन कोड भेजें', sending: 'भेजा जा रहा है…', resend: 'कोड दोबारा भेजें', code: 'छह अंकों का सत्यापन कोड', verify: 'ईमेल सत्यापित करें', verifying: 'सत्यापन हो रहा है…',
  sandbox: 'केवल स्थानीय विकास: ईमेल नहीं भेजा गया। परीक्षण कोड:', queued: 'सत्यापन ईमेल कतार में है। इनबॉक्स देखें; कोड 10 मिनट में समाप्त होगा।', sent: 'सहेजे लॉगिन ईमेल पर कोड भेजा गया है। यह 10 मिनट में समाप्त होगा। दोबारा भेजने से पहले 60 सेकंड रुकें।',
  continue: 'डैशबोर्ड पर जाएँ', ready: 'प्रोफ़ाइल पूरी है और ईमेल सत्यापित है।',
};
export const personalProfileCopy = (lang: LanguageCode) => lang === 'hi' ? hi : en;
