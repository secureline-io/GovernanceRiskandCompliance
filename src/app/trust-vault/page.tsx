'use client';

import { useState, useEffect } from 'react';
import {
  Eye,
  Shield,
  Award,
  FileCheck,
  Lock,
  Activity,
  AlertCircle,
  Download,
  Eye as EyeOff,
  EyeOff as EyeIcon,
  ExternalLink,
  ChevronDown,
  Zap,
  Check,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Certification {
  id: string;
  name: string;
  status: 'Active' | 'Pending' | 'Expired';
  validFrom: string;
  validTo: string;
  isPublished: boolean;
}

interface SecurityPractice {
  id: string;
  title: string;
  description: string;
  icon: any;
}

interface CustomizationSettings {
  companyName: string;
  logoUrl: string;
  accentColor: string;
  showCertifications: boolean;
  showPolicies: boolean;
  showSecurityPractices: boolean;
  showFaqs: boolean;
}

const MOCK_CERTIFICATIONS: Certification[] = [
  {
    id: 'cert-001',
    name: 'SOC 2 Type II',
    status: 'Active',
    validFrom: '2023-01-15',
    validTo: '2025-01-14',
    isPublished: true,
  },
  {
    id: 'cert-002',
    name: 'ISO 27001',
    status: 'Active',
    validFrom: '2022-06-20',
    validTo: '2025-06-19',
    isPublished: true,
  },
  {
    id: 'cert-003',
    name: 'GDPR Compliance',
    status: 'Active',
    validFrom: '2023-03-01',
    validTo: '2026-02-28',
    isPublished: true,
  },
  {
    id: 'cert-004',
    name: 'HIPAA',
    status: 'Pending',
    validFrom: '2024-02-15',
    validTo: '2027-02-14',
    isPublished: false,
  },
  {
    id: 'cert-005',
    name: 'SOC 3 (Public)',
    status: 'Active',
    validFrom: '2024-01-01',
    validTo: '2025-12-31',
    isPublished: true,
  },
];

const MOCK_POLICIES = [
  'Privacy Policy',
  'Data Processing Agreement',
  'Security Policy',
  'Incident Response Plan',
  'Acceptable Use Policy',
  'Data Retention Policy',
  'Third-Party Risk Management',
  'Business Continuity Plan',
  'Change Management Policy',
  'Access Control Policy',
  'Encryption Standards',
  'Audit Log Retention',
];

const SECURITY_PRACTICES: SecurityPractice[] = [
  {
    id: 'enc',
    title: 'Encryption',
    description: 'All data in transit and at rest is encrypted using AES-256 standards',
    icon: Lock,
  },
  {
    id: 'access',
    title: 'Access Control',
    description:
      'Role-based access control with multi-factor authentication for all users',
    icon: Shield,
  },
  {
    id: 'monitoring',
    title: 'Monitoring & Logging',
    description:
      'Real-time security monitoring with 24/7 SOC support and comprehensive logging',
    icon: Activity,
  },
  {
    id: 'incident',
    title: 'Incident Response',
    description:
      'Documented incident response procedures with less than 1-hour initial response SLA',
    icon: AlertCircle,
  },
];

const MOCK_FAQS = [
  {
    id: 'faq-1',
    question: 'How is customer data protected?',
    answer:
      'We employ multiple layers of security including encryption at rest (AES-256), encryption in transit (TLS 1.2+), and strict access controls. Regular security audits and penetration testing validate our security posture.',
  },
  {
    id: 'faq-2',
    question: 'What certifications do you maintain?',
    answer:
      'We maintain SOC 2 Type II, ISO 27001, and GDPR compliance certifications. These are independently audited annually to ensure ongoing compliance with international security standards.',
  },
  {
    id: 'faq-3',
    question: 'How do you handle security incidents?',
    answer:
      'We have a documented incident response plan with initial response within 1 hour. Critical incidents are escalated immediately to senior security personnel and affected customers are notified within 24 hours.',
  },
  {
    id: 'faq-4',
    question: 'What is your uptime guarantee?',
    answer:
      'We maintain 99.9% uptime SLA backed by redundant infrastructure across multiple availability zones. Our infrastructure is continuously monitored and automatically scaled.',
  },
  {
    id: 'faq-5',
    question: 'Can I request a security audit of your systems?',
    answer:
      'Yes, enterprise customers can request third-party security audits. We facilitate approved security assessments and provide SOC 2 reports upon request and under NDA.',
  },
  {
    id: 'faq-6',
    question: 'How do you manage third-party risks?',
    answer:
      'All third-party vendors undergo security assessments before integration. We maintain a vendor risk registry and conduct annual re-assessments of critical vendors.',
  },
];

const COMPLIANCE_FRAMEWORKS = [
  { name: 'SOC 2 Type II', compliance: 95, color: 'bg-sky-500' },
  { name: 'ISO 27001', compliance: 98, color: 'bg-emerald-500' },
  { name: 'GDPR', compliance: 100, color: 'bg-indigo-500' },
  { name: 'NIST CSF', compliance: 92, color: 'bg-amber-500' },
];

export default function TrustVaultPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [customization, setCustomization] = useState<CustomizationSettings>({
    companyName: 'SecureFlow Inc.',
    logoUrl: 'https://via.placeholder.com/150',
    accentColor: '#0ea5e9',
    showCertifications: true,
    showPolicies: true,
    showSecurityPractices: true,
    showFaqs: true,
  });
  const [policyVisibility, setPolicyVisibility] = useState<Record<string, boolean>>(
    MOCK_POLICIES.reduce((acc, p) => ({ ...acc, [p]: true }), {})
  );

  useEffect(() => {
    const savedCustomization = localStorage.getItem('trustVaultCustomization');
    const savedPolicies = localStorage.getItem('trustVaultPolicies');
    const savedCerts = localStorage.getItem('trustVaultCertifications');

    if (savedCustomization) {
      setCustomization(JSON.parse(savedCustomization));
    }
    if (savedPolicies) {
      setPolicyVisibility(JSON.parse(savedPolicies));
    }
    if (savedCerts) {
      setCertifications(JSON.parse(savedCerts));
    } else {
      setCertifications(MOCK_CERTIFICATIONS);
    }

    setIsLoading(false);
  }, []);

  const handleCustomizationChange = (key: keyof CustomizationSettings, value: any) => {
    const updated = { ...customization, [key]: value };
    setCustomization(updated);
    localStorage.setItem('trustVaultCustomization', JSON.stringify(updated));
  };

  const handlePolicyToggle = (policy: string) => {
    const updated = { ...policyVisibility, [policy]: !policyVisibility[policy] };
    setPolicyVisibility(updated);
    localStorage.setItem('trustVaultPolicies', JSON.stringify(updated));
  };

  const handleShowPreview = () => {
    const previewUrl = `https://trust.example.com/public/${customization.companyName.toLowerCase().replace(/\s+/g, '-')}`;
    alert(
      `Trust Center Preview URL:\n\n${previewUrl}\n\nThis is a mock URL for demonstration purposes.`
    );
  };

  const publishedCertCount = certifications.filter(
    (c) => c.isPublished
  ).length;
  const activeCertCount = certifications.filter((c) => c.status === 'Active').length;
  const publishedPoliciesCount = Object.values(policyVisibility).filter(
    Boolean
  ).length;

  const StatCard = ({
    label,
    value,
    icon: Icon,
  }: {
    label: string;
    value: string | number;
    icon: any;
  }) => (
    <div className="animate-fadeIn">
      <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-shadow rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-slate-900">{value}</p>
              <p className="text-sm text-slate-600 mt-1">{label}</p>
            </div>
            <div className="w-12 h-12 bg-sky-500/10 rounded-2xl flex items-center justify-center">
              <Icon className="w-6 h-6 text-sky-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-12 bg-slate-200 rounded-2xl w-48 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-slate-200 rounded-2xl animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 animate-fadeIn">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Trust Center</h1>
        <p className="text-slate-600">
          Manage your public-facing trust center and security certifications
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Published Documents" value={publishedPoliciesCount} icon={FileCheck} />
        <StatCard label="Active Certifications" value={activeCertCount} icon={Award} />
        <StatCard label="Page Views (30d)" value="2,847" icon={Eye} />
        <StatCard label="Uptime" value="99.9%" icon={Shield} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {customization.showCertifications && (
            <Card className="border-slate-200/60 shadow-sm rounded-2xl animate-fadeIn">
              <CardHeader>
                <CardTitle className="text-xl text-slate-900">
                  Certifications & Badges
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {certifications.map((cert) => (
                    <Card
                      key={cert.id}
                      className="border-slate-200/60 rounded-2xl hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <h3 className="font-semibold text-slate-900">{cert.name}</h3>
                            <span
                              className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                                cert.status === 'Active'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : cert.status === 'Pending'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {cert.status}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 space-y-1">
                            <p>Valid from: {cert.validFrom}</p>
                            <p>Valid to: {cert.validTo}</p>
                          </div>
                          <div className="flex items-center gap-2 pt-2">
                            {cert.status === 'Active' && (
                              <button
                                className="flex-1 px-3 py-2 bg-sky-500/10 text-sky-600 rounded-lg hover:bg-sky-500/20 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                              >
                                <Download className="w-4 h-4" />
                                Certificate
                              </button>
                            )}
                            <button
                              onClick={() => handlePolicyToggle(cert.name)}
                              className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                                policyVisibility[cert.name]
                                  ? 'bg-emerald-500/10 text-emerald-600'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {policyVisibility[cert.name] ? 'Published' : 'Hidden'}
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {customization.showSecurityPractices && (
            <Card className="border-slate-200/60 shadow-sm rounded-2xl animate-fadeIn">
              <CardHeader>
                <CardTitle className="text-xl text-slate-900">
                  Security Practices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {SECURITY_PRACTICES.map((practice) => {
                    const IconComponent = practice.icon;
                    return (
                      <Card
                        key={practice.id}
                        className="border-slate-200/60 rounded-2xl hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4">
                          <div className="flex gap-3">
                            <div className="w-10 h-10 bg-sky-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <IconComponent className="w-5 h-5 text-sky-500" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-900">
                                {practice.title}
                              </h3>
                              <p className="text-sm text-slate-600 mt-1">
                                {practice.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {customization.showSecurityPractices && (
            <Card className="border-slate-200/60 shadow-sm rounded-2xl animate-fadeIn">
              <CardHeader>
                <CardTitle className="text-xl text-slate-900">
                  Compliance Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {COMPLIANCE_FRAMEWORKS.map((framework) => (
                  <div key={framework.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-900">
                        {framework.name}
                      </span>
                      <span className="text-sm font-semibold text-slate-600">
                        {framework.compliance}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200/60 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${framework.color}`}
                        style={{ width: `${framework.compliance}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {customization.showFaqs && (
            <Card className="border-slate-200/60 shadow-sm rounded-2xl animate-fadeIn">
              <CardHeader>
                <CardTitle className="text-xl text-slate-900">
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {MOCK_FAQS.map((faq) => (
                  <button
                    key={faq.id}
                    onClick={() =>
                      setExpandedFaq(expandedFaq === faq.id ? null : faq.id)
                    }
                    className="w-full text-left"
                  >
                    <div className="p-4 bg-slate-50/50 rounded-xl hover:bg-slate-100/50 transition-colors border border-slate-200/60">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-slate-900">
                          {faq.question}
                        </h3>
                        <ChevronDown
                          className={`w-5 h-5 text-slate-600 transition-transform ${
                            expandedFaq === faq.id ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                      {expandedFaq === faq.id && (
                        <p className="mt-3 text-slate-600 text-sm">{faq.answer}</p>
                      )}
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          )}

          {customization.showPolicies && (
            <Card className="border-slate-200/60 shadow-sm rounded-2xl animate-fadeIn">
              <CardHeader>
                <CardTitle className="text-xl text-slate-900">
                  Published Policies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {MOCK_POLICIES.map((policy) => (
                    <div
                      key={policy}
                      className="flex items-center justify-between p-3 bg-slate-50/50 rounded-lg border border-slate-200/60 hover:bg-slate-100/50 transition-colors"
                    >
                      <span className="font-medium text-slate-900">{policy}</span>
                      <button
                        onClick={() => handlePolicyToggle(policy)}
                        className="p-1 hover:bg-slate-200/60 rounded transition-colors"
                      >
                        {policyVisibility[policy] ? (
                          <Eye className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <EyeIcon className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-slate-200/60 shadow-sm rounded-2xl animate-fadeIn sticky top-8">
            <CardHeader>
              <CardTitle className="text-lg text-slate-900">Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <button
                onClick={handleShowPreview}
                className="w-full px-4 py-3 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Preview Trust Center
              </button>
              <p className="text-xs text-slate-600 text-center">
                View how your trust center appears to customers
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200/60 shadow-sm rounded-2xl animate-fadeIn">
            <CardHeader>
              <CardTitle className="text-lg text-slate-900">Customize</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-900">
                  Company Name
                </label>
                <input
                  type="text"
                  value={customization.companyName}
                  onChange={(e) =>
                    handleCustomizationChange('companyName', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-slate-200/60 rounded-lg focus:outline-none focus:border-sky-500 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-900">
                  Logo URL
                </label>
                <input
                  type="url"
                  value={customization.logoUrl}
                  onChange={(e) =>
                    handleCustomizationChange('logoUrl', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-slate-200/60 rounded-lg focus:outline-none focus:border-sky-500 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-900">
                  Accent Color
                </label>
                <input
                  type="color"
                  value={customization.accentColor}
                  onChange={(e) =>
                    handleCustomizationChange('accentColor', e.target.value)
                  }
                  className="w-full h-10 border border-slate-200/60 rounded-lg cursor-pointer"
                />
              </div>

              <div className="border-t border-slate-200/60 pt-4 space-y-3">
                <label className="text-sm font-semibold text-slate-900 block">
                  Visible Sections
                </label>
                <div className="space-y-2">
                  {[
                    {
                      key: 'showCertifications',
                      label: 'Certifications & Badges',
                    },
                    { key: 'showPolicies', label: 'Published Policies' },
                    {
                      key: 'showSecurityPractices',
                      label: 'Security Practices',
                    },
                    { key: 'showFaqs', label: 'FAQs' },
                  ].map((section) => (
                    <div key={section.key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={section.key}
                        checked={
                          customization[
                            section.key as keyof CustomizationSettings
                          ] as boolean
                        }
                        onChange={(e) =>
                          handleCustomizationChange(
                            section.key as keyof CustomizationSettings,
                            e.target.checked
                          )
                        }
                        className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
                      />
                      <label
                        htmlFor={section.key}
                        className="text-sm text-slate-600 cursor-pointer"
                      >
                        {section.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
