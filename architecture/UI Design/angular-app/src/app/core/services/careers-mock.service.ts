import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type CareerStatus = 'Draft' | 'Published' | 'Closed';
export interface CareerJob {
  id: string;
  title: { en: string; hi: string };
  department: string;
  location: string;
  employmentType: string;
  summary: { en: string; hi: string };
  description: { en: string; hi: string };
  requirements: { en: string; hi: string };
  applicationUrl: string;
  closingDate: string;
  status: CareerStatus;
  updatedAt: string;
}

const SEED_JOBS: CareerJob[] = [
  { id: 'JOB-001', title: { en: 'Senior Backend Engineer', hi: 'सीनियर बैकएंड इंजीनियर' }, department: 'Engineering', location: 'Noida', employmentType: 'Full-time', summary: { en: 'Build reliable services powering India’s freight network.', hi: 'भारत के माल परिवहन नेटवर्क को सक्षम बनाने वाली विश्वसनीय सेवाएँ बनाएँ।' }, description: { en: 'Design and build scalable backend systems for TransportSeva products.', hi: 'TransportSeva उत्पादों के लिए विस्तार योग्य बैकएंड सिस्टम डिज़ाइन और बनाएँ।' }, requirements: { en: 'Strong experience with APIs, databases and distributed systems.', hi: 'API, डेटाबेस और वितरित सिस्टम का अच्छा अनुभव।' }, applicationUrl: '', closingDate: '', status: 'Published', updatedAt: '20 Sep 2026' },
  { id: 'JOB-002', title: { en: 'Product Manager - Fleet Ops', hi: 'प्रोडक्ट मैनेजर - फ्लीट ऑप्स' }, department: 'Product', location: 'Noida', employmentType: 'Full-time', summary: { en: 'Shape tools that help fleets operate efficiently.', hi: 'बेहतर फ्लीट संचालन के लिए उपयोगी टूल्स बनाएँ।' }, description: { en: 'Own discovery, prioritization and delivery for fleet operations workflows.', hi: 'फ्लीट ऑपरेशन वर्कफ़्लो के लिए रिसर्च, प्राथमिकता और डिलीवरी की जिम्मेदारी लें।' }, requirements: { en: 'Experience delivering B2B SaaS products and working with operations teams.', hi: 'B2B SaaS उत्पादों और ऑपरेशन टीमों के साथ काम करने का अनुभव।' }, applicationUrl: '', closingDate: '', status: 'Published', updatedAt: '20 Sep 2026' },
  { id: 'JOB-003', title: { en: 'Regional Sales Manager - North', hi: 'रीजनल सेल्स मैनेजर - उत्तर' }, department: 'Sales', location: 'Delhi NCR', employmentType: 'Full-time', summary: { en: 'Grow trusted partnerships with shippers and transporters.', hi: 'शिपर्स और ट्रांसपोर्टर्स के साथ भरोसेमंद साझेदारी बढ़ाएँ।' }, description: { en: 'Build a strong regional pipeline and support customers through onboarding.', hi: 'क्षेत्रीय बिक्री अवसर विकसित करें और ऑनबोर्डिंग में ग्राहकों की मदद करें।' }, requirements: { en: 'B2B sales experience; logistics experience is a plus.', hi: 'B2B बिक्री का अनुभव; लॉजिस्टिक्स अनुभव वांछनीय है।' }, applicationUrl: '', closingDate: '', status: 'Published', updatedAt: '20 Sep 2026' },
  { id: 'JOB-004', title: { en: 'Customer Support Executive', hi: 'ग्राहक सहायता कार्यकारी' }, department: 'Operations', location: 'Remote', employmentType: 'Full-time', summary: { en: 'Help customers and fleet partners get the most from TransportSeva.', hi: 'ग्राहकों और फ्लीट पार्टनर्स को TransportSeva का बेहतर उपयोग करने में सहायता करें।' }, description: { en: 'Resolve customer questions and coordinate with internal operations teams.', hi: 'ग्राहकों के प्रश्न हल करें और आंतरिक ऑपरेशन टीमों के साथ समन्वय करें।' }, requirements: { en: 'Clear communication and a customer-first approach.', hi: 'स्पष्ट संवाद और ग्राहक-केंद्रित सोच।' }, applicationUrl: '', closingDate: '', status: 'Published', updatedAt: '20 Sep 2026' },
  { id: 'JOB-005', title: { en: 'UI/UX Designer', hi: 'यूआई/यूएक्स डिज़ाइनर' }, department: 'Design', location: 'Noida', employmentType: 'Full-time', summary: { en: 'Create clear, accessible experiences for logistics teams.', hi: 'लॉजिस्टिक्स टीमों के लिए सरल और सुलभ अनुभव डिज़ाइन करें।' }, description: { en: 'Research user needs and turn them into polished product flows and interfaces.', hi: 'उपयोगकर्ता की ज़रूरतें समझकर बेहतर उत्पाद अनुभव और इंटरफ़ेस बनाएँ।' }, requirements: { en: 'A strong product design portfolio and prototyping experience.', hi: 'उत्पाद डिज़ाइन पोर्टफोलियो और प्रोटोटाइप बनाने का अनुभव।' }, applicationUrl: '', closingDate: '', status: 'Published', updatedAt: '20 Sep 2026' },
  { id: 'JOB-006', title: { en: 'Data Analyst - Logistics', hi: 'डेटा एनालिस्ट - लॉजिस्टिक्स' }, department: 'Data & Analytics', location: 'Bengaluru', employmentType: 'Full-time', summary: { en: 'Turn freight and fleet data into practical insights.', hi: 'फ्रेट और फ्लीट डेटा से उपयोगी जानकारी निकालें।' }, description: { en: 'Develop analysis and reporting that supports better logistics decisions.', hi: 'बेहतर लॉजिस्टिक्स निर्णयों के लिए विश्लेषण और रिपोर्टिंग विकसित करें।' }, requirements: { en: 'Strong SQL and analytical skills; logistics domain knowledge is helpful.', hi: 'SQL और विश्लेषण कौशल; लॉजिस्टिक्स की समझ उपयोगी होगी।' }, applicationUrl: '', closingDate: '', status: 'Published', updatedAt: '20 Sep 2026' },
];

@Injectable({ providedIn: 'root' })
export class CareersMockService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly state = signal<CareerJob[]>(SEED_JOBS);
  readonly jobs = this.state.asReadonly();
  readonly publishedJobs = computed(() => this.state().filter((job) => job.status === 'Published' && (!job.closingDate || job.closingDate >= new Date().toISOString().slice(0, 10))));

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const saved = localStorage.getItem('transportseva.careers.v1');
        if (saved) {
          const parsed: unknown = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.every((job) => this.isJob(job))) this.state.set(parsed);
        }
      } catch { /* use seed data when storage is unavailable or invalid */ }
    }
    effect(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      try { localStorage.setItem('transportseva.careers.v1', JSON.stringify(this.state())); } catch { /* keep the in-memory prototype usable */ }
    });
  }

  save(job: CareerJob): void {
    const saved = { ...job, updatedAt: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) };
    this.state.update((jobs) => jobs.some((item) => item.id === saved.id) ? jobs.map((item) => item.id === saved.id ? saved : item) : [saved, ...jobs]);
  }
  setStatus(id: string, status: CareerStatus): void { this.state.update((jobs) => jobs.map((job) => job.id === id ? { ...job, status } : job)); }
  remove(id: string): void { this.state.update((jobs) => jobs.filter((job) => job.id !== id)); }

  private isJob(value: unknown): value is CareerJob {
    if (!value || typeof value !== 'object') return false;
    const job = value as CareerJob;
    const localized = (field: unknown) => !!field && typeof field === 'object' && typeof (field as { en?: unknown }).en === 'string' && typeof (field as { hi?: unknown }).hi === 'string';
    return typeof job.id === 'string' && localized(job.title) && localized(job.summary) && localized(job.description) && localized(job.requirements)
      && typeof job.department === 'string' && typeof job.location === 'string' && typeof job.employmentType === 'string'
      && typeof job.applicationUrl === 'string' && typeof job.closingDate === 'string' && typeof job.updatedAt === 'string'
      && ['Draft', 'Published', 'Closed'].includes(job.status);
  }
}
