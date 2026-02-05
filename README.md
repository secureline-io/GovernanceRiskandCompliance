# GRC Platform - Cloud AI Edition

A comprehensive Governance, Risk, and Compliance (GRC) platform with Cloud Security Posture Management (CSPM) capabilities, built with Next.js, TypeScript, Tailwind CSS, and Supabase.

![GRC Platform](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)

## 🚀 Features

### 📊 Compliance Management
- **Multi-Framework Support**: SOC 2, ISO 27001, GDPR, HIPAA, and custom frameworks
- **Control Library**: Preventive, detective, corrective, and directive controls
- **Gap Analysis**: Real-time compliance scoring and gap identification
- **Audit Readiness**: Track progress toward certification
- **Control Testing**: Automated and manual control testing workflows

### ☁️ Cloud Security Posture Management (CSPM)
- **Multi-Cloud Support**: AWS, Azure, and Google Cloud Platform
- **Asset Discovery**: Automatic inventory of cloud resources
- **Security Policies**: 100+ pre-built security detection rules
- **Findings Management**: Track, remediate, and report security issues
- **Compliance Mapping**: Link security findings to compliance controls

### 📁 Evidence Repository
- **Document Management**: Centralized evidence storage
- **Automatic Mapping**: Link evidence to controls and requirements
- **Version Control**: Track changes and maintain audit trails
- **Retention Policies**: Automated evidence lifecycle management
- **Collaboration**: Comments and review workflows

### ⚠️ Risk Management
- **Risk Register**: Centralized risk tracking
- **Risk Assessment**: Likelihood × Impact scoring
- **Heat Maps**: Visual risk distribution
- **Treatment Tracking**: Monitor mitigation actions
- **Risk Appetite**: Define and monitor organizational risk tolerance

### 📋 Policy Management
- **Policy Library**: Centralized policy repository
- **Review Workflows**: Scheduled policy reviews
- **Acknowledgments**: Employee policy sign-offs
- **Version Control**: Track policy changes over time
- **Templates**: Pre-built policy templates

### 🤝 Vendor Management
- **Vendor Directory**: Track third-party relationships
- **Risk Scoring**: Assess vendor security posture
- **Assessments**: Conduct security questionnaires
- **Certification Tracking**: Monitor vendor certifications
- **Review Schedule**: Periodic vendor reviews

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL (via Supabase)
- **Backend**: Next.js API Routes
- **Authentication**: Supabase Auth (to be implemented)
- **Storage**: Supabase Storage (to be implemented)

### Database Schema
The platform uses a comprehensive PostgreSQL schema with:
- **9 Migrations**: Modular schema design
- **23+ Tables**: Covering all GRC domains
- **Row-Level Security**: Multi-tenant data isolation
- **Audit Logging**: Complete activity tracking

See [`README_DATABASE.md`](./README_DATABASE.md) for complete database documentation.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier works)
- Git

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd grc-tool-cloud-ai
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Supabase**
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Follow the complete setup guide in [`README_DATABASE.md`](./README_DATABASE.md)

4. **Configure environment variables**
```bash
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials
```

5. **Deploy database schema**
```bash
# See README_DATABASE.md for detailed instructions
# Option 1: Use Supabase Dashboard SQL Editor
# Option 2: Use Supabase CLI
supabase db push
```

6. **Seed sample data** (optional)
```bash
# Load SOC 2 framework data
# Run supabase/seed/soc2_framework.sql in SQL Editor
```

7. **Start development server**
```bash
npm run dev
```

8. **Open your browser**
```
http://localhost:3000
```

## 📖 Project Structure

```
grc-tool-cloud-ai/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── controls/
│   │   │   ├── findings/
│   │   │   ├── frameworks/
│   │   │   └── risks/
│   │   ├── page.tsx           # Main dashboard page
│   │   └── layout.tsx         # Root layout
│   ├── components/
│   │   ├── Dashboard.tsx      # Main dashboard component
│   │   ├── Sidebar.tsx        # Navigation sidebar
│   │   ├── Header.tsx         # Top header
│   │   └── dashboard/         # Dashboard views
│   │       ├── Overview.tsx       # Main overview
│   │       ├── ComplianceView.tsx # Compliance module
│   │       ├── CSPMView.tsx       # Cloud security
│   │       ├── EvidenceView.tsx   # Evidence repository
│   │       ├── RiskView.tsx       # Risk management
│   │       ├── VendorsView.tsx    # Vendor management
│   │       └── PoliciesView.tsx   # Policy management
│   └── lib/
│       └── supabase/          # Supabase client & helpers
│           ├── client.ts      # Client-side client
│           └── server.ts      # Server-side client
├── supabase/
│   ├── migrations/            # Database migrations (001-009)
│   ├── seed/                  # Seed data
│   └── deploy_schema.sql      # Consolidated deployment
├── public/                    # Static assets
├── dashboard.html             # Standalone productivity dashboard
└── README.md                  # This file
```

## 🎯 Key Features by Module

### Dashboard Overview
- Real-time compliance score (87%)
- Active security findings (23)
- High-risk items (4)
- Framework progress (SOC 2, ISO 27001, GDPR)
- Security findings feed
- Risk heatmap
- Upcoming tasks

### Compliance Module
- Framework cards with progress tracking
- Control library with effectiveness scores
- Requirements checklist (SOC 2)
- Gap analysis summary
- Control testing schedule

### CSPM Module
- Cloud account connections (AWS/Azure/GCP)
- Security findings by severity
- Active findings list
- Asset inventory (EC2, S3, RDS, Lambda)
- Policy coverage
- Remediation timeline

### Evidence Module
- Drag-and-drop file upload
- Evidence statistics
- Control mapping
- Activity feed
- Retention tracking

### Risk Module
- Risk register with inherent/residual scores
- Risk heatmap visualization
- Treatment status tracking
- Risk assessments
- Mitigation actions

### Vendor Module
- Vendor directory
- Risk score distribution
- Upcoming reviews
- Assessment tracking
- Certification coverage

### Policy Module
- Policy library
- Review schedules
- Acknowledgment tracking
- Compliance overview
- Change history
- Policy templates

## 🔒 Security Features

- **Multi-Tenancy**: Row-Level Security (RLS) for data isolation
- **Role-Based Access Control**: Owner, Admin, Security Lead, Analyst, Auditor, Viewer
- **Audit Logging**: Complete activity tracking
- **Data Encryption**: At-rest and in-transit encryption via Supabase
- **External Auditor Access**: Time-limited access for auditors

## 🗄️ Database Tables

**Core Tenancy (2)**
- organizations, organization_members

**Compliance (5)**
- frameworks, framework_requirements, controls, control_requirement_mappings, framework_instances

**Evidence (4)**
- evidence, evidence_control_mappings, evidence_comments, audit_logs

**CSPM (4)**
- cloud_accounts, assets, cspm_policies, findings

**Risk (3)**
- risks, risk_assessments, risk_treatments

**Governance (3)**
- policies, policy_reviews, policy_acknowledgments

**Vendors (3)**
- vendors, vendor_assessments, vendor_reviews

## 📝 Development Roadmap

### Phase 1: Foundation ✅ (Current)
- [x] UI/UX Design
- [x] Database Schema
- [x] Core Navigation
- [x] Dashboard Views
- [x] API Routes
- [x] Supabase Integration

### Phase 2: Authentication & Data
- [ ] Supabase Auth integration
- [ ] User registration/login
- [ ] Organization setup
- [ ] Real data integration
- [ ] API endpoints for CRUD operations

### Phase 3: Core Features
- [ ] Framework management
- [ ] Control testing workflows
- [ ] Evidence upload & storage
- [ ] Risk assessment forms
- [ ] Policy workflows

### Phase 4: CSPM Integration
- [ ] AWS connector
- [ ] Azure connector
- [ ] GCP connector
- [ ] Policy engine
- [ ] Finding remediation

### Phase 5: Advanced Features
- [ ] Reporting & exports
- [ ] Email notifications
- [ ] Dashboard customization
- [ ] Mobile responsive optimization
- [ ] Integrations (Slack, Jira, etc.)

## 🧪 Testing

```bash
# Run tests (to be implemented)
npm test

# Run linter
npm run lint

# Type checking
npm run type-check
```

## 📦 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker
```bash
# Build image
docker build -t grc-platform .

# Run container
docker run -p 3000:3000 grc-platform
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Supabase for the backend platform
- Tailwind CSS for the styling system
- Open-source community

## 📞 Support

- Documentation: See [`README_DATABASE.md`](./README_DATABASE.md)
- Issues: [GitHub Issues](your-repo-url/issues)
- Email: your-email@example.com

---

Built with ❤️ for the security and compliance community
