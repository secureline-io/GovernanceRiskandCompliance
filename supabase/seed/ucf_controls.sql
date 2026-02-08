-- ============================================
-- GRC Platform - Unified Control Library (UCF)
-- Comprehensive seed data for universal controls
-- Total: ~120 controls across 13 categories
-- ============================================

-- ============================================
-- 1. ACCESS CONTROL (UCF-AC-001 to UCF-AC-015)
-- ============================================
INSERT INTO ucf_controls (id, code, title, description, category, subcategory, guidance, typical_evidence_types, sort_order, created_at, updated_at) VALUES

(gen_random_uuid(), 'UCF-AC-001', 'Identity Lifecycle Management',
 'The organization establishes and maintains a formal process for creating, modifying, and disabling user identities across all information systems. This ensures that only authorized individuals have system access and that identities are promptly removed when no longer required.',
 'Access Control', 'Identity Management',
 'Implement an identity management system that integrates with HR processes. Automate provisioning upon hire and deprovisioning upon termination. Reconcile identity records against HR data at least quarterly to detect orphaned or unauthorized accounts.',
 ARRAY['Identity management system configuration', 'HR-IT integration workflow documentation', 'Account provisioning/deprovisioning logs', 'Quarterly reconciliation reports'],
 1, NOW(), NOW()),

(gen_random_uuid(), 'UCF-AC-002', 'Multi-Factor Authentication',
 'The organization enforces multi-factor authentication for all user access to critical systems, remote access, and privileged accounts. MFA must combine at least two distinct authentication factors: something the user knows, has, or is.',
 'Access Control', 'Authentication',
 'Deploy MFA across all externally accessible systems, VPN connections, privileged account access, and cloud management consoles. Prefer phishing-resistant methods such as FIDO2/WebAuthn over SMS-based OTP. Maintain an exception register for systems that cannot support MFA with compensating controls documented.',
 ARRAY['MFA configuration screenshots', 'MFA enrollment statistics', 'MFA exception register', 'Authentication policy document'],
 2, NOW(), NOW()),

(gen_random_uuid(), 'UCF-AC-003', 'Access Provisioning and Authorization',
 'Access to information systems is provisioned through a formal request and approval process that ensures each access grant is authorized by the data or system owner before activation. Access rights are granted based on the principle of least privilege.',
 'Access Control', 'Provisioning',
 'Implement a ticketing-based access request workflow requiring manager and system owner approval. Define role-based access control (RBAC) templates aligned with job functions. Ensure no user can self-approve their own access requests. Log all provisioning actions with timestamps and approver identities.',
 ARRAY['Access request tickets with approval chains', 'RBAC role definitions', 'Access provisioning logs', 'Least privilege policy documentation'],
 3, NOW(), NOW()),

(gen_random_uuid(), 'UCF-AC-004', 'Access Deprovisioning and Revocation',
 'The organization promptly revokes or modifies access rights when personnel terminate employment, change roles, or no longer require access. Timely deprovisioning reduces the risk of unauthorized access through dormant accounts.',
 'Access Control', 'Deprovisioning',
 'Revoke all access within 24 hours of termination and within 72 hours of role changes. Automate deprovisioning by integrating identity systems with HR termination workflows. Conduct monthly scans for dormant accounts (no login in 90+ days) and disable them. Immediately revoke access for involuntary terminations.',
 ARRAY['Termination checklists with timestamps', 'Automated deprovisioning workflow logs', 'Dormant account scan reports', 'Access revocation confirmation records'],
 4, NOW(), NOW()),

(gen_random_uuid(), 'UCF-AC-005', 'Privileged Access Management',
 'The organization restricts, monitors, and controls the use of privileged accounts (e.g., root, administrator, database admin). Elevated privileges are granted only when necessary and are subject to enhanced oversight and logging.',
 'Access Control', 'Privilege Management',
 'Implement a privileged access management (PAM) solution to vault and rotate privileged credentials. Require just-in-time (JIT) privilege elevation with time-limited sessions. Record all privileged sessions for audit review. Separate administrative accounts from standard user accounts for all personnel with elevated access.',
 ARRAY['PAM tool configuration and session logs', 'Privileged account inventory', 'JIT elevation request records', 'Privileged session recordings or logs'],
 5, NOW(), NOW()),

(gen_random_uuid(), 'UCF-AC-006', 'Periodic Access Reviews',
 'The organization conducts periodic reviews of user access rights to verify that all access remains appropriate, authorized, and aligned with current job responsibilities. Access that is no longer justified is promptly revoked.',
 'Access Control', 'Access Reviews',
 'Perform user access reviews at least quarterly for critical systems and semi-annually for all other systems. System and data owners must certify each user access entitlement. Track remediation of inappropriate access findings to closure. Maintain evidence of reviewer sign-off and remediation actions.',
 ARRAY['Access review schedules', 'User access certification reports with sign-off', 'Remediation tracking records', 'Access review completion metrics'],
 6, NOW(), NOW()),

(gen_random_uuid(), 'UCF-AC-007', 'Single Sign-On Integration',
 'The organization implements single sign-on (SSO) to centralize authentication across applications, reducing credential sprawl and enabling consistent enforcement of authentication policies including MFA.',
 'Access Control', 'Authentication',
 'Integrate all SaaS and internal applications with the corporate identity provider (IdP) using SAML 2.0 or OIDC. Maintain an inventory of applications with their SSO integration status. Establish a policy requiring SSO for all new application onboarding. Disable local authentication where SSO is available.',
 ARRAY['SSO-integrated application inventory', 'IdP configuration documentation', 'SAML/OIDC integration records', 'Local authentication disable confirmation'],
 7, NOW(), NOW()),

(gen_random_uuid(), 'UCF-AC-008', 'Password and Credential Policy',
 'The organization establishes and enforces credential standards including password complexity, length, expiration, and reuse restrictions across all systems. Credentials are stored using strong cryptographic hashing.',
 'Access Control', 'Authentication',
 'Require a minimum password length of 12 characters with complexity requirements. Prohibit reuse of the last 12 passwords. Enforce account lockout after 5 failed attempts. Store passwords using bcrypt, scrypt, or Argon2 hashing. Screen new passwords against known-breached credential databases.',
 ARRAY['Password policy document', 'System password configuration screenshots', 'Account lockout policy settings', 'Credential hashing verification records'],
 8, NOW(), NOW()),

(gen_random_uuid(), 'UCF-AC-009', 'Remote Access Security',
 'The organization controls and secures remote access to organizational systems, ensuring that remote connections are authenticated, encrypted, and monitored. Remote access methods are approved and configured according to security standards.',
 'Access Control', 'Remote Access',
 'Require VPN or zero-trust network access (ZTNA) for all remote connections to internal resources. Enforce MFA on all remote access sessions. Monitor and log remote access connections. Restrict remote access to approved devices that meet minimum security baselines (patched, encrypted, endpoint protection active).',
 ARRAY['VPN/ZTNA configuration documentation', 'Remote access policy', 'Remote connection logs', 'Device compliance check records'],
 9, NOW(), NOW()),

(gen_random_uuid(), 'UCF-AC-010', 'Service Account Management',
 'The organization inventories, secures, and monitors all service accounts and non-human identities used for system-to-system authentication, automated processes, and application integrations.',
 'Access Control', 'Service Accounts',
 'Maintain a complete inventory of all service accounts with designated owners. Rotate service account credentials at least every 90 days or use certificate-based authentication. Restrict service account permissions to the minimum necessary for their function. Disable interactive login for service accounts. Review service accounts quarterly.',
 ARRAY['Service account inventory with owners', 'Credential rotation logs', 'Service account permission audits', 'Quarterly review documentation'],
 10, NOW(), NOW()),

(gen_random_uuid(), 'UCF-AC-011', 'Session Management',
 'The organization enforces session controls including automatic timeout, concurrent session limits, and session lock after periods of inactivity to prevent unauthorized access through unattended sessions.',
 'Access Control', 'Session Management',
 'Configure automatic session timeout after 15 minutes of inactivity for standard users and 5 minutes for privileged sessions. Limit concurrent sessions per user to prevent credential sharing. Enforce re-authentication for sensitive transactions. Implement secure session token handling to prevent hijacking.',
 ARRAY['Session timeout configuration screenshots', 'Session management policy', 'System configuration audit reports', 'Session security testing results'],
 11, NOW(), NOW()),

(gen_random_uuid(), 'UCF-AC-012', 'Network Access Control',
 'The organization restricts network access to authorized users and devices through network-level authentication, segmentation, and access control lists. Unauthorized devices are prevented from connecting to the corporate network.',
 'Access Control', 'Network Access',
 'Implement 802.1X network access control (NAC) for wired and wireless connections. Maintain an approved device inventory and block unrecognized devices. Segment guest and BYOD traffic from production networks. Use certificate-based authentication for corporate devices where feasible.',
 ARRAY['NAC configuration documentation', 'Approved device inventory', 'Network segmentation diagrams', '802.1X enrollment records'],
 12, NOW(), NOW()),

(gen_random_uuid(), 'UCF-AC-013', 'API Access Control',
 'The organization secures API endpoints through authentication, authorization, rate limiting, and input validation. API keys and tokens are managed with the same rigor as user credentials.',
 'Access Control', 'API Security',
 'Require OAuth 2.0 or API key authentication for all API endpoints. Implement rate limiting and throttling to prevent abuse. Enforce authorization checks at each API endpoint, not just at the gateway. Rotate API keys regularly and revoke keys for decommissioned integrations. Log all API access for audit.',
 ARRAY['API authentication configuration', 'API key inventory and rotation logs', 'Rate limiting configuration', 'API access logs'],
 13, NOW(), NOW()),

(gen_random_uuid(), 'UCF-AC-014', 'Emergency and Break-Glass Access',
 'The organization defines and controls emergency access procedures that allow authorized personnel to obtain elevated access during critical incidents, with full logging and post-incident review of all emergency access usage.',
 'Access Control', 'Emergency Access',
 'Establish documented break-glass procedures with sealed credential envelopes or PAM emergency workflows. Require dual authorization for emergency access activation when feasible. Log all emergency access usage with immutable audit trails. Conduct mandatory post-incident review of every emergency access event within 48 hours.',
 ARRAY['Break-glass procedure documentation', 'Emergency access usage logs', 'Post-incident access review reports', 'Dual authorization records'],
 14, NOW(), NOW()),

(gen_random_uuid(), 'UCF-AC-015', 'Segregation of Duties',
 'The organization enforces segregation of duties (SoD) to ensure that no single individual can control all aspects of a critical process or transaction. Conflicting duties are identified and separated across different roles.',
 'Access Control', 'Segregation of Duties',
 'Define and document SoD rules for critical business processes including financial transactions, user provisioning, and change management. Implement SoD checks in access management workflows to prevent conflicting role assignments. Review SoD conflicts quarterly and document compensating controls where separation is not feasible.',
 ARRAY['SoD matrix documentation', 'Conflicting role detection reports', 'Compensating control documentation', 'Quarterly SoD review records'],
 15, NOW(), NOW());


-- ============================================
-- 2. CHANGE MANAGEMENT (UCF-CM-001 to UCF-CM-010)
-- ============================================
INSERT INTO ucf_controls (id, code, title, description, category, subcategory, guidance, typical_evidence_types, sort_order, created_at, updated_at) VALUES

(gen_random_uuid(), 'UCF-CM-001', 'Change Request and Intake Process',
 'The organization maintains a formal change management process requiring all changes to information systems, infrastructure, and configurations to be submitted as documented requests before implementation.',
 'Change Management', 'Change Process',
 'Implement a change management ticketing system where all changes are logged with a description, justification, and requestor information. Classify changes by type (standard, normal, emergency) with appropriate workflows for each. Prohibit undocumented changes to production environments.',
 ARRAY['Change management policy', 'Change request tickets', 'Change classification criteria documentation', 'Change management system configuration'],
 16, NOW(), NOW()),

(gen_random_uuid(), 'UCF-CM-002', 'Change Impact Assessment',
 'Each proposed change undergoes a documented impact assessment evaluating the risk, scope, and potential effects on system availability, security, performance, and dependent services before approval.',
 'Change Management', 'Risk Assessment',
 'Require impact assessments that evaluate security, availability, performance, and compliance implications. Document affected systems, services, and stakeholders for each change. Assign a risk rating (low, medium, high, critical) that determines the required approval level and testing rigor.',
 ARRAY['Impact assessment forms', 'Risk rating documentation', 'Dependency analysis records', 'Stakeholder notification logs'],
 17, NOW(), NOW()),

(gen_random_uuid(), 'UCF-CM-003', 'Change Approval Workflow',
 'Changes are approved by designated authorities (e.g., change advisory board, system owners, security team) commensurate with the risk level before implementation. No change proceeds without documented authorization.',
 'Change Management', 'Approval',
 'Define approval authority levels: low-risk changes require system owner approval; medium and high-risk changes require Change Advisory Board (CAB) approval; changes affecting security controls require security team sign-off. Document approvals with timestamps and approver identities in the change record.',
 ARRAY['CAB meeting minutes', 'Change approval records with signatures', 'Approval authority matrix', 'Change ticket approval timestamps'],
 18, NOW(), NOW()),

(gen_random_uuid(), 'UCF-CM-004', 'Pre-Deployment Testing',
 'Changes are tested in a non-production environment before deployment to production. Testing validates functional requirements, security posture, and compatibility with existing systems.',
 'Change Management', 'Testing',
 'Maintain staging or pre-production environments that mirror production configurations. Require documented test plans and test results for each change. Include security regression testing for changes affecting security controls. Obtain sign-off on test results before production deployment approval.',
 ARRAY['Test plans and test cases', 'Test execution results', 'Staging environment configuration records', 'Test sign-off documentation'],
 19, NOW(), NOW()),

(gen_random_uuid(), 'UCF-CM-005', 'Rollback and Backout Procedures',
 'Each change includes a documented rollback plan that can restore the system to its previous state if the change causes unexpected issues. Rollback procedures are tested for high-risk changes.',
 'Change Management', 'Rollback',
 'Require a rollback plan as a mandatory field in every change request. For high-risk changes, validate the rollback procedure in the staging environment before production deployment. Define rollback triggers and decision criteria. Maintain system backups or snapshots taken immediately before change implementation.',
 ARRAY['Rollback plan documentation', 'Pre-change backup/snapshot records', 'Rollback test results for high-risk changes', 'Rollback execution logs'],
 20, NOW(), NOW()),

(gen_random_uuid(), 'UCF-CM-006', 'Emergency Change Procedures',
 'The organization defines expedited procedures for emergency changes required to address critical security vulnerabilities or production outages, with retroactive documentation and approval within a defined timeframe.',
 'Change Management', 'Emergency Changes',
 'Define what qualifies as an emergency change (e.g., active security incident, critical production failure). Allow expedited approval by a single designated authority. Require full documentation and retroactive CAB review within 48 hours. Track emergency change frequency as a metric to detect process abuse.',
 ARRAY['Emergency change policy', 'Emergency change tickets with retroactive approval', 'Post-implementation review records', 'Emergency change frequency metrics'],
 21, NOW(), NOW()),

(gen_random_uuid(), 'UCF-CM-007', 'Release Management',
 'The organization manages software releases through a structured process that coordinates build, test, and deployment activities to ensure releases are delivered reliably and traceably.',
 'Change Management', 'Release Management',
 'Implement CI/CD pipelines with automated build, test, and deployment stages. Require release notes documenting all changes included in each release. Use semantic versioning or equivalent release numbering. Maintain release calendars and coordinate deployment windows to minimize business disruption.',
 ARRAY['CI/CD pipeline configuration', 'Release notes and changelogs', 'Deployment pipeline execution logs', 'Release calendar and schedules'],
 22, NOW(), NOW()),

(gen_random_uuid(), 'UCF-CM-008', 'Configuration Management',
 'The organization maintains baseline configurations for all system components and tracks deviations from approved baselines. Configuration changes are managed through the change control process.',
 'Change Management', 'Configuration',
 'Establish and document security baselines for operating systems, databases, network devices, and applications using CIS Benchmarks or equivalent standards. Use configuration management tools (e.g., Ansible, Terraform, Chef) to enforce baselines as code. Scan for configuration drift at least weekly and remediate deviations.',
 ARRAY['Configuration baseline documents', 'Configuration management tool outputs', 'Drift detection scan reports', 'Baseline deviation remediation records'],
 23, NOW(), NOW()),

(gen_random_uuid(), 'UCF-CM-009', 'Version Control and Code Management',
 'All source code, infrastructure-as-code, and configuration files are maintained in version control systems with branching strategies, commit history, and access controls that ensure traceability and integrity.',
 'Change Management', 'Version Control',
 'Use Git-based version control for all code and configuration artifacts. Enforce branch protection rules requiring pull request reviews and approvals before merging to main branches. Prohibit force pushes to protected branches. Maintain commit signing to verify author identity. Retain full commit history.',
 ARRAY['Version control system configuration', 'Branch protection rule screenshots', 'Pull request review and approval records', 'Commit history logs'],
 24, NOW(), NOW()),

(gen_random_uuid(), 'UCF-CM-010', 'Change Documentation and Audit Trail',
 'All changes maintain a complete audit trail from request through implementation, including approvals, test results, deployment records, and post-implementation verification. Change records are retained per the retention policy.',
 'Change Management', 'Documentation',
 'Ensure change records are immutable after closure and include: requestor, description, impact assessment, approvals, test results, deployment logs, and post-implementation verification. Generate change management reports monthly showing change volume, success rates, and emergency change percentage. Retain change records for a minimum of 3 years.',
 ARRAY['Complete change record examples', 'Monthly change management reports', 'Change audit trail exports', 'Record retention compliance evidence'],
 25, NOW(), NOW());


-- ============================================
-- 3. DATA PROTECTION (UCF-DP-001 to UCF-DP-012)
-- ============================================
INSERT INTO ucf_controls (id, code, title, description, category, subcategory, guidance, typical_evidence_types, sort_order, created_at, updated_at) VALUES

(gen_random_uuid(), 'UCF-DP-001', 'Data Classification and Handling',
 'The organization classifies information assets according to their sensitivity and business value, and defines handling requirements for each classification level. All data is labeled and handled according to its assigned classification.',
 'Data Protection', 'Data Classification',
 'Define at least four classification levels (e.g., Public, Internal, Confidential, Restricted). Document handling requirements for each level covering storage, transmission, access, sharing, and disposal. Train all employees on classification criteria and their responsibilities. Label data repositories and systems with their highest classification level.',
 ARRAY['Data classification policy', 'Classification level definitions and handling matrix', 'Data labeling examples', 'Classification training completion records'],
 26, NOW(), NOW()),

(gen_random_uuid(), 'UCF-DP-002', 'Encryption at Rest',
 'Sensitive data stored in databases, file systems, backups, and removable media is protected using strong encryption. Encryption at rest ensures data confidentiality even if storage media is physically compromised.',
 'Data Protection', 'Encryption',
 'Encrypt all data classified as Confidential or above at rest using AES-256 or equivalent. Enable transparent data encryption (TDE) on databases. Encrypt full disk on endpoints and servers. Encrypt backup media before offsite transport. Verify encryption status through regular scans and include results in compliance reporting.',
 ARRAY['Encryption configuration documentation', 'Full disk encryption status reports', 'Database TDE configuration screenshots', 'Encryption scanning results'],
 27, NOW(), NOW()),

(gen_random_uuid(), 'UCF-DP-003', 'Encryption in Transit',
 'Data transmitted over networks is protected using strong encryption protocols to prevent interception, eavesdropping, and man-in-the-middle attacks. All external and internal sensitive communications use encrypted channels.',
 'Data Protection', 'Encryption',
 'Enforce TLS 1.2 or higher for all web traffic, API communications, and email transport. Disable legacy protocols (SSLv3, TLS 1.0, TLS 1.1). Use certificate pinning for mobile applications. Implement HSTS headers on all web applications. Encrypt internal service-to-service communication in production environments.',
 ARRAY['TLS configuration screenshots', 'SSL/TLS scan results (e.g., Qualys SSL Labs)', 'HSTS header verification', 'Protocol version audit reports'],
 28, NOW(), NOW()),

(gen_random_uuid(), 'UCF-DP-004', 'Cryptographic Key Management',
 'The organization manages cryptographic keys throughout their lifecycle including generation, distribution, storage, rotation, revocation, and destruction. Keys are protected commensurate with the sensitivity of the data they protect.',
 'Data Protection', 'Key Management',
 'Use hardware security modules (HSMs) or cloud KMS services for key storage. Implement automated key rotation at defined intervals (at least annually). Establish procedures for emergency key revocation. Separate key management duties so that no single individual controls the complete key lifecycle. Maintain a key inventory.',
 ARRAY['Key management policy', 'HSM/KMS configuration documentation', 'Key rotation logs', 'Key inventory with ownership and expiration dates'],
 29, NOW(), NOW()),

(gen_random_uuid(), 'UCF-DP-005', 'Data Loss Prevention',
 'The organization implements data loss prevention (DLP) controls to detect and prevent unauthorized transmission, exfiltration, or leakage of sensitive data through email, web uploads, removable media, and cloud services.',
 'Data Protection', 'Data Loss Prevention',
 'Deploy DLP solutions monitoring email, web traffic, endpoint file transfers, and cloud application usage. Define DLP rules aligned with data classification levels. Configure alerts for policy violations and block high-severity data exfiltration attempts. Review DLP incidents weekly and tune rules to reduce false positives.',
 ARRAY['DLP solution configuration', 'DLP policy rule definitions', 'DLP incident reports and response records', 'Weekly DLP review meeting minutes'],
 30, NOW(), NOW()),

(gen_random_uuid(), 'UCF-DP-006', 'Data Retention and Archival',
 'The organization defines and enforces data retention periods based on legal, regulatory, and business requirements. Data is retained for the required period and securely disposed of when the retention period expires.',
 'Data Protection', 'Data Lifecycle',
 'Maintain a data retention schedule mapping each data type to its required retention period and authoritative source (regulation, contract, business need). Implement automated retention enforcement in storage systems where possible. Conduct annual reviews of the retention schedule. Track disposal activities to confirm compliance.',
 ARRAY['Data retention schedule', 'Retention policy document', 'Automated retention rule configurations', 'Annual retention schedule review records'],
 31, NOW(), NOW()),

(gen_random_uuid(), 'UCF-DP-007', 'Secure Data Disposal',
 'The organization securely destroys or sanitizes data and media when it is no longer needed, ensuring that sensitive information cannot be recovered from decommissioned systems, storage devices, or documents.',
 'Data Protection', 'Data Lifecycle',
 'Use NIST SP 800-88 compliant media sanitization methods. Physically destroy storage devices that contained Restricted data. Obtain certificates of destruction from third-party disposal vendors. Maintain a disposal log recording the asset, sanitization method, date, and responsible individual.',
 ARRAY['Media sanitization procedures', 'Certificates of destruction', 'Disposal logs', 'Vendor disposal service agreements'],
 32, NOW(), NOW()),

(gen_random_uuid(), 'UCF-DP-008', 'Backup and Recovery',
 'The organization performs regular backups of critical data and systems, stores backups securely, and validates restoration procedures to ensure data can be recovered within defined recovery objectives.',
 'Data Protection', 'Backup',
 'Define backup frequency based on Recovery Point Objective (RPO) for each system tier. Store backups in geographically separate locations from production. Encrypt all backups. Test backup restoration quarterly for critical systems and annually for all others. Monitor backup job completion and alert on failures.',
 ARRAY['Backup policy and schedules', 'Backup job completion reports', 'Restoration test results', 'Backup encryption verification records'],
 33, NOW(), NOW()),

(gen_random_uuid(), 'UCF-DP-009', 'Data Masking and Anonymization',
 'The organization applies data masking, pseudonymization, or anonymization techniques to protect sensitive data in non-production environments, reports, and datasets shared with third parties or used for testing and development.',
 'Data Protection', 'Data Minimization',
 'Prohibit the use of production data containing PII or sensitive information in development and test environments unless masked. Implement automated masking pipelines for data refresh to non-production. Use anonymization for analytics datasets where individual identification is not required. Validate that masked data cannot be re-identified.',
 ARRAY['Data masking policy', 'Masking tool configuration and output samples', 'Non-production environment data handling procedures', 'Re-identification risk assessment records'],
 34, NOW(), NOW()),

(gen_random_uuid(), 'UCF-DP-010', 'Database Security',
 'The organization secures databases through access controls, activity monitoring, hardened configurations, and regular patching. Database administrative access is restricted and monitored.',
 'Data Protection', 'Database Security',
 'Apply CIS Benchmark hardening guidelines to all database instances. Restrict database access to application service accounts and authorized DBAs. Enable database activity monitoring (DAM) for sensitive databases. Remove default accounts and sample databases. Separate database servers on dedicated network segments.',
 ARRAY['Database hardening configuration reports', 'Database access control lists', 'Database activity monitoring logs', 'CIS Benchmark compliance scan results'],
 35, NOW(), NOW()),

(gen_random_uuid(), 'UCF-DP-011', 'Data Integrity Controls',
 'The organization implements controls to detect and prevent unauthorized modification of data, ensuring accuracy and completeness of information throughout its lifecycle including processing, storage, and transmission.',
 'Data Protection', 'Data Integrity',
 'Implement checksums or hash verification for critical data transfers. Use database constraints, triggers, and transaction controls to enforce data integrity rules. Maintain audit trails for all modifications to critical data records. Perform periodic data integrity checks comparing source and destination data.',
 ARRAY['Data integrity check procedures', 'Hash verification logs', 'Database constraint documentation', 'Data reconciliation reports'],
 36, NOW(), NOW()),

(gen_random_uuid(), 'UCF-DP-012', 'Personal Data Handling',
 'The organization implements specific safeguards for personally identifiable information (PII) and personal data, ensuring collection limitation, purpose specification, and appropriate handling throughout the data lifecycle.',
 'Data Protection', 'Personal Data',
 'Maintain an inventory of all systems processing personal data. Implement data minimization -- collect only the personal data necessary for the stated purpose. Establish defined retention periods for personal data. Provide mechanisms for data subject access and deletion requests. Train staff handling personal data on privacy requirements.',
 ARRAY['Personal data inventory', 'Data minimization assessment records', 'Data subject request handling logs', 'Privacy-specific training completion records'],
 37, NOW(), NOW());


-- ============================================
-- 4. SECURITY OPERATIONS (UCF-SO-001 to UCF-SO-012)
-- ============================================
INSERT INTO ucf_controls (id, code, title, description, category, subcategory, guidance, typical_evidence_types, sort_order, created_at, updated_at) VALUES

(gen_random_uuid(), 'UCF-SO-001', 'Continuous Security Monitoring',
 'The organization implements continuous monitoring of information systems and security controls to detect security events, anomalies, and policy violations in near real-time.',
 'Security Operations', 'Monitoring',
 'Deploy monitoring agents across all servers, endpoints, network devices, and cloud workloads. Define monitoring use cases covering unauthorized access, malware activity, data exfiltration, and configuration changes. Establish a 24/7 monitoring capability either in-house or through a managed SOC provider. Review monitoring coverage quarterly.',
 ARRAY['Monitoring architecture documentation', 'Use case library', 'SOC coverage and SLA documentation', 'Monitoring coverage gap analysis reports'],
 38, NOW(), NOW()),

(gen_random_uuid(), 'UCF-SO-002', 'Centralized Log Management',
 'The organization collects, aggregates, and retains security-relevant logs from all critical systems in a centralized, tamper-resistant log management platform with defined retention periods.',
 'Security Operations', 'Log Management',
 'Forward logs from all servers, network devices, security tools, applications, and cloud services to a centralized SIEM or log aggregation platform. Ensure log integrity through write-once storage or hash chaining. Retain security logs for a minimum of 12 months online and 24 months in archive. Synchronize time sources across all logging systems using NTP.',
 ARRAY['Log management architecture diagram', 'Log source inventory', 'Log retention configuration', 'NTP synchronization verification records'],
 39, NOW(), NOW()),

(gen_random_uuid(), 'UCF-SO-003', 'SIEM and Security Alerting',
 'The organization operates a Security Information and Event Management (SIEM) system that correlates events from multiple sources, applies detection rules, and generates alerts for security team investigation.',
 'Security Operations', 'Detection',
 'Configure SIEM correlation rules for known attack patterns (brute force, lateral movement, privilege escalation, data exfiltration). Tune alert thresholds to minimize false positives while maintaining detection efficacy. Establish alert triage and escalation procedures with defined SLAs. Review and update detection rules monthly based on threat intelligence.',
 ARRAY['SIEM configuration and rule documentation', 'Alert triage procedures', 'Alert volume and false positive rate metrics', 'Monthly rule tuning records'],
 40, NOW(), NOW()),

(gen_random_uuid(), 'UCF-SO-004', 'Threat Detection and Hunting',
 'The organization proactively identifies threats through automated detection capabilities and periodic threat hunting exercises that search for indicators of compromise and adversary techniques not caught by automated tools.',
 'Security Operations', 'Threat Detection',
 'Maintain detection coverage mapped to the MITRE ATT&CK framework. Conduct threat hunting exercises at least quarterly, focused on high-risk adversary techniques relevant to the organization threat profile. Document hunting hypotheses, data sources queried, findings, and resulting detection improvements.',
 ARRAY['MITRE ATT&CK coverage map', 'Threat hunting reports', 'Detection rule improvements from hunting', 'Threat hunting exercise schedule'],
 41, NOW(), NOW()),

(gen_random_uuid(), 'UCF-SO-005', 'Vulnerability Management',
 'The organization identifies, prioritizes, and remediates vulnerabilities in information systems through regular scanning, risk-based prioritization, and tracked remediation within defined SLAs.',
 'Security Operations', 'Vulnerability Management',
 'Scan all internet-facing assets weekly and internal assets at least monthly with authenticated vulnerability scans. Prioritize remediation using CVSS scores adjusted for asset criticality and exploitability. Define remediation SLAs: critical (48 hours), high (7 days), medium (30 days), low (90 days). Track remediation rates and aging as KPIs.',
 ARRAY['Vulnerability scan reports', 'Remediation SLA definitions', 'Vulnerability aging and trending reports', 'Scan coverage metrics'],
 42, NOW(), NOW()),

(gen_random_uuid(), 'UCF-SO-006', 'Patch Management',
 'The organization applies security patches and updates to operating systems, applications, firmware, and third-party software in a timely manner based on the severity of the vulnerability addressed.',
 'Security Operations', 'Patch Management',
 'Establish a patch management cycle: emergency patches within 48 hours, critical patches within 7 days, routine patches within 30 days. Test patches in a staging environment before production deployment. Maintain a patch compliance dashboard showing patch status across all managed assets. Address systems that cannot be patched with documented compensating controls.',
 ARRAY['Patch management policy', 'Patch compliance dashboards', 'Patch deployment logs', 'Compensating control documentation for unpatched systems'],
 43, NOW(), NOW()),

(gen_random_uuid(), 'UCF-SO-007', 'Endpoint Protection',
 'The organization deploys endpoint detection and response (EDR) capabilities on all endpoints including workstations, laptops, and servers to detect, prevent, and respond to malicious activity.',
 'Security Operations', 'Endpoint Security',
 'Deploy EDR agents on all managed endpoints with real-time protection enabled. Configure EDR to detect and block known malware, ransomware, fileless attacks, and suspicious behaviors. Ensure EDR coverage exceeds 98% of all managed endpoints. Integrate EDR alerts with the SIEM for correlated detection. Review quarantine and detection events daily.',
 ARRAY['EDR deployment coverage reports', 'EDR configuration documentation', 'Detection and quarantine event logs', 'Endpoint protection compliance metrics'],
 44, NOW(), NOW()),

(gen_random_uuid(), 'UCF-SO-008', 'Malware Prevention',
 'The organization implements multiple layers of malware prevention including endpoint antimalware, email gateway filtering, web proxy scanning, and network-level controls to block malicious content delivery.',
 'Security Operations', 'Malware Prevention',
 'Deploy anti-malware at the endpoint, email gateway, and web proxy layers. Enable real-time scanning and scheduled full system scans. Block known malicious file types at the email gateway. Implement sandboxing for suspicious attachments and URLs. Update malware signatures at least daily through automated feeds.',
 ARRAY['Anti-malware deployment configuration', 'Email gateway filtering rules', 'Malware detection statistics', 'Signature update logs'],
 45, NOW(), NOW()),

(gen_random_uuid(), 'UCF-SO-009', 'Security Scanning and Assessment',
 'The organization conducts regular security assessments including vulnerability scans, configuration audits, and compliance checks to identify weaknesses and verify that security controls are operating effectively.',
 'Security Operations', 'Security Assessment',
 'Perform automated compliance scans against security baselines (CIS, DISA STIG) monthly. Conduct web application security scans (DAST) quarterly for customer-facing applications. Perform cloud security posture assessments weekly. Track assessment findings through remediation and report on posture improvement trends.',
 ARRAY['Compliance scan reports', 'Web application scan results', 'Cloud security posture assessment reports', 'Remediation tracking dashboards'],
 46, NOW(), NOW()),

(gen_random_uuid(), 'UCF-SO-010', 'Penetration Testing',
 'The organization conducts periodic penetration testing by qualified assessors to simulate real-world attacks and identify exploitable vulnerabilities in systems, applications, and infrastructure.',
 'Security Operations', 'Penetration Testing',
 'Conduct external penetration testing at least annually and after significant infrastructure changes. Conduct internal penetration testing annually. Engage independent third-party testers with relevant certifications (OSCP, CREST). Define clear scope, rules of engagement, and communication procedures. Track all findings through remediation and re-test.',
 ARRAY['Penetration test scope and rules of engagement', 'Penetration test reports', 'Finding remediation tracking', 'Re-test validation results'],
 47, NOW(), NOW()),

(gen_random_uuid(), 'UCF-SO-011', 'Security Metrics and Reporting',
 'The organization defines, collects, and reports on security metrics and key performance indicators (KPIs) to measure the effectiveness of the security program and support data-driven decision making.',
 'Security Operations', 'Metrics',
 'Define KPIs covering: vulnerability remediation rates, mean time to detect (MTTD), mean time to respond (MTTR), patch compliance rates, phishing simulation click rates, incident counts by severity, and security training completion. Report metrics monthly to security leadership and quarterly to executive management.',
 ARRAY['Security metrics dashboard', 'Monthly security reports', 'Quarterly executive security reports', 'KPI trend analysis documentation'],
 48, NOW(), NOW()),

(gen_random_uuid(), 'UCF-SO-012', 'Threat Intelligence',
 'The organization consumes, analyzes, and operationalizes threat intelligence from multiple sources to enhance detection capabilities, prioritize vulnerability remediation, and inform risk decisions.',
 'Security Operations', 'Threat Intelligence',
 'Subscribe to threat intelligence feeds relevant to the organization industry and technology stack. Integrate threat intelligence indicators (IOCs) into SIEM detection rules and firewall block lists. Produce periodic threat briefings summarizing relevant threats and recommended defensive actions. Participate in industry threat sharing communities (ISACs).',
 ARRAY['Threat intelligence feed subscriptions', 'IOC integration logs', 'Threat briefing documents', 'ISAC membership and participation records'],
 49, NOW(), NOW());


-- ============================================
-- 5. INCIDENT RESPONSE (UCF-IR-001 to UCF-IR-008)
-- ============================================
INSERT INTO ucf_controls (id, code, title, description, category, subcategory, guidance, typical_evidence_types, sort_order, created_at, updated_at) VALUES

(gen_random_uuid(), 'UCF-IR-001', 'Incident Detection and Triage',
 'The organization establishes capabilities and procedures to detect security incidents promptly through automated monitoring, employee reporting, and external notification channels, with defined triage criteria for initial assessment.',
 'Incident Response', 'Detection',
 'Define incident detection sources: SIEM alerts, EDR detections, employee reports, customer reports, law enforcement notifications, and threat intelligence alerts. Establish a single point of contact for incident reporting. Implement initial triage procedures to validate incidents and determine severity within 30 minutes of detection.',
 ARRAY['Incident detection and triage procedures', 'Incident reporting channel documentation', 'Triage decision tree', 'Mean time to triage metrics'],
 50, NOW(), NOW()),

(gen_random_uuid(), 'UCF-IR-002', 'Incident Classification and Severity',
 'The organization classifies security incidents according to a defined severity scale that determines response urgency, escalation requirements, communication obligations, and resource allocation.',
 'Incident Response', 'Classification',
 'Define severity levels (e.g., SEV-1 Critical through SEV-4 Low) with clear criteria based on data sensitivity, system impact, business disruption, and regulatory implications. Map each severity level to response time SLAs, escalation paths, and communication requirements. Assign incident commanders for SEV-1 and SEV-2 incidents.',
 ARRAY['Incident classification matrix', 'Severity level definitions and SLAs', 'Escalation path documentation', 'Incident severity assignment records'],
 51, NOW(), NOW()),

(gen_random_uuid(), 'UCF-IR-003', 'Incident Containment Procedures',
 'The organization implements containment strategies to limit the scope and impact of confirmed security incidents, preventing further damage while preserving evidence for investigation.',
 'Incident Response', 'Containment',
 'Define containment playbooks for common incident types (malware, unauthorized access, data breach, DDoS, insider threat). Include both short-term containment (isolation, blocking) and long-term containment (patching, reconfiguration) steps. Ensure containment actions preserve forensic evidence. Document all containment actions with timestamps.',
 ARRAY['Containment playbooks by incident type', 'Containment action logs', 'Evidence preservation procedures', 'Containment decision records'],
 52, NOW(), NOW()),

(gen_random_uuid(), 'UCF-IR-004', 'Eradication and Recovery',
 'The organization removes the root cause of security incidents and restores affected systems to normal operations through validated recovery procedures, ensuring threats are fully eliminated before restoration.',
 'Incident Response', 'Recovery',
 'Identify and eliminate all attacker footholds, malware, and compromised credentials before system restoration. Rebuild compromised systems from known-good baselines rather than attempting to clean in place. Validate system integrity and security posture before returning to production. Monitor recovered systems with enhanced vigilance for re-infection.',
 ARRAY['Eradication action logs', 'System rebuild records', 'Post-recovery validation checklists', 'Enhanced monitoring configuration for recovered systems'],
 53, NOW(), NOW()),

(gen_random_uuid(), 'UCF-IR-005', 'Incident Communication Plan',
 'The organization maintains a communication plan for security incidents that defines internal and external notification requirements, spokespersons, communication templates, and regulatory reporting obligations.',
 'Incident Response', 'Communication',
 'Define communication workflows for each severity level including: internal escalation to leadership, customer notification timelines, regulatory reporting requirements (e.g., 72-hour GDPR breach notification), law enforcement engagement criteria, and public communications. Pre-approve communication templates. Designate authorized spokespersons.',
 ARRAY['Incident communication plan', 'Notification templates', 'Regulatory reporting requirements matrix', 'Stakeholder contact lists'],
 54, NOW(), NOW()),

(gen_random_uuid(), 'UCF-IR-006', 'Post-Incident Review',
 'The organization conducts a formal post-incident review (lessons learned) after every significant security incident to identify root causes, evaluate response effectiveness, and implement improvements to prevent recurrence.',
 'Incident Response', 'Lessons Learned',
 'Conduct post-incident reviews within 5 business days of incident closure for SEV-1 and SEV-2 incidents and within 10 business days for SEV-3. Use a blameless retrospective format. Document root cause analysis, timeline reconstruction, response effectiveness assessment, and specific improvement actions with owners and due dates. Track improvement actions to completion.',
 ARRAY['Post-incident review reports', 'Root cause analysis documentation', 'Improvement action tracking', 'Incident timeline reconstructions'],
 55, NOW(), NOW()),

(gen_random_uuid(), 'UCF-IR-007', 'Digital Forensic Capability',
 'The organization maintains the capability to conduct digital forensic investigations to support incident response, determine the scope of compromise, preserve evidence, and support potential legal proceedings.',
 'Incident Response', 'Forensics',
 'Establish or contract digital forensic investigation capabilities with trained personnel and appropriate tooling. Define evidence handling procedures that maintain chain of custody. Ensure forensic readiness through adequate logging, disk imaging capabilities, and network capture tools. Maintain relationships with external forensic firms for surge capacity.',
 ARRAY['Forensic capability documentation', 'Evidence handling and chain of custody procedures', 'Forensic tool inventory', 'External forensic firm retainer agreements'],
 56, NOW(), NOW()),

(gen_random_uuid(), 'UCF-IR-008', 'Incident Documentation and Tracking',
 'The organization maintains detailed documentation of all security incidents throughout their lifecycle, creating a searchable incident database that supports trend analysis, metrics reporting, and regulatory inquiries.',
 'Incident Response', 'Documentation',
 'Record all incidents in a centralized tracking system with: detection source, classification, timeline, affected assets, containment and eradication actions, root cause, business impact, and resolution. Generate monthly incident reports showing trends, severity distribution, and response time metrics. Retain incident records for a minimum of 5 years.',
 ARRAY['Incident tracking system records', 'Monthly incident summary reports', 'Incident trend analysis', 'Incident record retention verification'],
 57, NOW(), NOW());


-- ============================================
-- 6. BUSINESS CONTINUITY (UCF-BC-001 to UCF-BC-008)
-- ============================================
INSERT INTO ucf_controls (id, code, title, description, category, subcategory, guidance, typical_evidence_types, sort_order, created_at, updated_at) VALUES

(gen_random_uuid(), 'UCF-BC-001', 'Business Continuity Planning',
 'The organization develops and maintains a business continuity plan (BCP) that ensures critical business functions can continue during and recover after disruptive events including natural disasters, cyberattacks, and infrastructure failures.',
 'Business Continuity', 'Planning',
 'Develop BCPs for all critical business functions identified through business impact analysis. Plans must include activation criteria, roles and responsibilities, communication procedures, critical resource requirements, and recovery procedures. Review and update BCPs at least annually and after any significant organizational change. Distribute plans to all relevant personnel.',
 ARRAY['Business continuity plan documents', 'BCP distribution and acknowledgment records', 'Annual BCP review records', 'BCP update change logs'],
 58, NOW(), NOW()),

(gen_random_uuid(), 'UCF-BC-002', 'Disaster Recovery Planning',
 'The organization establishes disaster recovery (DR) plans for critical IT systems that define recovery procedures, infrastructure requirements, and team responsibilities to restore technology services within defined recovery objectives.',
 'Business Continuity', 'Disaster Recovery',
 'Document DR plans with specific recovery procedures for each critical system. Define Recovery Time Objectives (RTOs) and Recovery Point Objectives (RPOs) for each system tier. Maintain DR runbooks with step-by-step restoration instructions. Ensure DR plans address multiple disaster scenarios including site loss, data corruption, and ransomware.',
 ARRAY['Disaster recovery plan documents', 'RTO/RPO definitions by system', 'DR runbooks', 'DR plan review and update records'],
 59, NOW(), NOW()),

(gen_random_uuid(), 'UCF-BC-003', 'Backup Strategy and Execution',
 'The organization implements a tiered backup strategy aligned with recovery objectives, ensuring that backup frequency, retention, and storage locations support the ability to restore data and systems within required timeframes.',
 'Business Continuity', 'Backup',
 'Implement the 3-2-1 backup rule: at least 3 copies of data, on 2 different storage media, with 1 copy offsite or in a different cloud region. Define backup schedules aligned with RPOs: continuous/hourly for Tier 1, daily for Tier 2, weekly for Tier 3. Include application configurations and infrastructure-as-code in backup scope, not just data.',
 ARRAY['Backup strategy documentation', 'Backup schedule configurations', 'Backup completion and success rate reports', 'Offsite backup verification records'],
 60, NOW(), NOW()),

(gen_random_uuid(), 'UCF-BC-004', 'Recovery Testing and Validation',
 'The organization conducts regular recovery tests to validate that backup data can be restored successfully, DR plans work as documented, and recovery objectives (RTO/RPO) can be met under realistic conditions.',
 'Business Continuity', 'Testing',
 'Test DR plans at least annually with tabletop exercises and at least semi-annually with technical recovery tests for Tier 1 systems. Conduct full DR failover tests annually. Test individual backup restorations monthly on a rotating basis. Document test scenarios, results, gaps identified, and corrective actions. Measure actual recovery times against RTO targets.',
 ARRAY['DR test plans and schedules', 'DR test execution results', 'Backup restoration test records', 'RTO/RPO achievement measurements'],
 61, NOW(), NOW()),

(gen_random_uuid(), 'UCF-BC-005', 'Redundancy and Failover',
 'The organization architects critical systems with redundancy and automated failover capabilities to minimize single points of failure and ensure high availability of essential services.',
 'Business Continuity', 'Resilience',
 'Identify and eliminate single points of failure for Tier 1 and Tier 2 systems. Implement redundancy at the application, database, network, and infrastructure layers. Configure automated failover with health checks and appropriate failover thresholds. Test failover mechanisms quarterly. Document failover procedures for manual intervention if automation fails.',
 ARRAY['High availability architecture documentation', 'Single point of failure analysis', 'Failover test results', 'Uptime and availability metrics'],
 62, NOW(), NOW()),

(gen_random_uuid(), 'UCF-BC-006', 'Business Impact Analysis',
 'The organization conducts and maintains a business impact analysis (BIA) that identifies critical business processes, dependencies, and the quantified impact of disruption to determine recovery priorities and resource requirements.',
 'Business Continuity', 'Impact Analysis',
 'Conduct a BIA at least annually involving business process owners. Identify critical business functions, supporting IT systems, dependencies, and maximum tolerable downtime. Quantify financial and operational impact at defined intervals (1 hour, 4 hours, 1 day, 1 week). Use BIA results to set RTO/RPO targets and prioritize recovery investments.',
 ARRAY['Business impact analysis report', 'Critical process and dependency maps', 'Impact quantification worksheets', 'BIA review and update records'],
 63, NOW(), NOW()),

(gen_random_uuid(), 'UCF-BC-007', 'Crisis Communication',
 'The organization establishes crisis communication procedures that ensure timely, accurate, and consistent communication to stakeholders including employees, customers, partners, and regulators during disruptive events.',
 'Business Continuity', 'Communication',
 'Define crisis communication plans with: designated spokespersons, communication channels (email, status page, phone tree, social media), message templates for various scenarios, and stakeholder notification priority. Test crisis communication procedures during DR exercises. Maintain up-to-date contact lists for all critical stakeholders.',
 ARRAY['Crisis communication plan', 'Communication templates', 'Stakeholder contact lists', 'Communication test results from DR exercises'],
 64, NOW(), NOW()),

(gen_random_uuid(), 'UCF-BC-008', 'Alternate Site Operations',
 'The organization maintains the capability to operate critical business functions from alternate locations when primary facilities are unavailable, with pre-positioned resources and tested activation procedures.',
 'Business Continuity', 'Alternate Operations',
 'Identify and maintain alternate work locations for critical personnel including remote work capabilities and physical alternate sites if required. Pre-configure VPN, cloud access, and collaboration tools for distributed operations. Test alternate site activation at least annually. Ensure alternate sites meet minimum security requirements for the data classification handled.',
 ARRAY['Alternate site agreements or documentation', 'Remote work capability verification', 'Alternate site activation test results', 'Alternate site security assessment records'],
 65, NOW(), NOW());


-- ============================================
-- 7. RISK MANAGEMENT (UCF-RM-001 to UCF-RM-008)
-- ============================================
INSERT INTO ucf_controls (id, code, title, description, category, subcategory, guidance, typical_evidence_types, sort_order, created_at, updated_at) VALUES

(gen_random_uuid(), 'UCF-RM-001', 'Risk Assessment Methodology',
 'The organization establishes and maintains a documented risk assessment methodology that defines a consistent, repeatable approach to identifying, analyzing, and evaluating information security risks.',
 'Risk Management', 'Methodology',
 'Document a risk assessment methodology that specifies: risk identification techniques, likelihood and impact rating scales, risk scoring formula, risk acceptance criteria, and assessment frequency. Align the methodology with established frameworks (ISO 27005, NIST SP 800-30, FAIR). Train risk assessors on the methodology to ensure consistent application.',
 ARRAY['Risk assessment methodology document', 'Risk rating scales and criteria', 'Risk assessor training records', 'Methodology review and approval records'],
 66, NOW(), NOW()),

(gen_random_uuid(), 'UCF-RM-002', 'Risk Identification',
 'The organization systematically identifies information security risks through multiple methods including threat modeling, vulnerability assessments, control gap analysis, and input from stakeholders across business functions.',
 'Risk Management', 'Risk Identification',
 'Conduct formal risk identification sessions at least annually and when significant changes occur (new systems, new business processes, mergers, regulatory changes). Use structured techniques such as threat modeling for technical risks and scenario analysis for business risks. Maintain a risk register cataloging all identified risks with ownership assigned.',
 ARRAY['Risk register', 'Threat modeling outputs', 'Risk identification workshop records', 'Scenario analysis documentation'],
 67, NOW(), NOW()),

(gen_random_uuid(), 'UCF-RM-003', 'Risk Analysis and Scoring',
 'The organization analyzes identified risks by evaluating the likelihood of occurrence and potential business impact, producing a risk score that enables consistent prioritization and comparison of risks across the organization.',
 'Risk Management', 'Risk Analysis',
 'Assess each risk for likelihood (considering threat capability, vulnerability exploitability, and existing control effectiveness) and impact (considering financial, operational, reputational, and regulatory consequences). Calculate risk scores using the approved methodology. Classify risks as critical, high, medium, or low. Document analysis rationale for each risk.',
 ARRAY['Risk analysis worksheets', 'Risk scoring calculations', 'Risk heatmaps', 'Risk classification reports'],
 68, NOW(), NOW()),

(gen_random_uuid(), 'UCF-RM-004', 'Risk Treatment Plans',
 'The organization develops and implements risk treatment plans for all risks above the defined acceptance threshold, selecting appropriate treatment options (mitigate, transfer, avoid, or accept) with specific actions, owners, and timelines.',
 'Risk Management', 'Risk Treatment',
 'Require treatment plans for all risks rated above the organization risk appetite threshold. Each plan must specify: treatment option, specific actions to reduce risk, responsible owner, target completion date, and expected residual risk level. Track treatment plan progress at least monthly. Re-assess residual risk after treatment implementation.',
 ARRAY['Risk treatment plans', 'Treatment action tracking reports', 'Residual risk assessments', 'Risk treatment completion evidence'],
 69, NOW(), NOW()),

(gen_random_uuid(), 'UCF-RM-005', 'Continuous Risk Monitoring',
 'The organization continuously monitors the risk landscape through key risk indicators (KRIs), control effectiveness assessments, and environmental scanning to detect changes in risk levels between formal assessments.',
 'Risk Management', 'Risk Monitoring',
 'Define KRIs for the top organizational risks with thresholds that trigger review or action. Monitor KRIs monthly and report on trends. Re-assess risk ratings when KRI thresholds are breached or when significant changes occur (new vulnerabilities, incidents, regulatory changes). Integrate risk monitoring with security operations metrics.',
 ARRAY['Key risk indicator definitions and dashboards', 'KRI monitoring reports', 'Risk rating change logs', 'Trigger event and re-assessment records'],
 70, NOW(), NOW()),

(gen_random_uuid(), 'UCF-RM-006', 'Risk Appetite and Tolerance',
 'The organization defines and communicates risk appetite and tolerance levels that establish the boundaries for acceptable risk-taking, approved by senior leadership and used to guide risk treatment decisions.',
 'Risk Management', 'Risk Governance',
 'Document risk appetite statements approved by the board or executive leadership. Define quantitative risk tolerance thresholds for each risk category (e.g., maximum acceptable downtime, maximum acceptable financial loss). Review and reaffirm risk appetite annually. Use risk appetite to guide decisions on risk acceptance, investment prioritization, and control implementation.',
 ARRAY['Risk appetite statement', 'Risk tolerance threshold definitions', 'Board/executive approval records', 'Annual risk appetite review documentation'],
 71, NOW(), NOW()),

(gen_random_uuid(), 'UCF-RM-007', 'Risk Reporting',
 'The organization produces regular risk reports for management and the board that communicate the current risk profile, treatment progress, emerging risks, and key risk indicators to enable informed decision-making.',
 'Risk Management', 'Risk Reporting',
 'Produce monthly risk reports for security leadership and quarterly risk reports for the board or risk committee. Include: top risks ranked by severity, treatment plan status, KRI trends, new and closed risks, risk acceptance decisions, and emerging risk highlights. Use visual risk dashboards (heatmaps, trend charts) to communicate effectively.',
 ARRAY['Monthly risk reports', 'Quarterly board risk reports', 'Risk dashboard screenshots', 'Risk report distribution records'],
 72, NOW(), NOW()),

(gen_random_uuid(), 'UCF-RM-008', 'Emerging Risk Identification',
 'The organization maintains a process for identifying and evaluating emerging risks arising from new technologies, evolving threat landscapes, regulatory changes, and shifts in the business environment before they materialize as significant threats.',
 'Risk Management', 'Emerging Risks',
 'Establish an emerging risk identification process fed by threat intelligence, industry trend analysis, regulatory monitoring, and technology roadmap reviews. Evaluate emerging risks quarterly with input from cross-functional stakeholders. Add emerging risks to the risk register with preliminary assessments. Brief leadership on emerging risks that may require preemptive investment.',
 ARRAY['Emerging risk assessment reports', 'Threat landscape analysis documents', 'Regulatory change tracking records', 'Emerging risk briefing presentations'],
 73, NOW(), NOW());


-- ============================================
-- 8. GOVERNANCE (UCF-GV-001 to UCF-GV-010)
-- ============================================
INSERT INTO ucf_controls (id, code, title, description, category, subcategory, guidance, typical_evidence_types, sort_order, created_at, updated_at) VALUES

(gen_random_uuid(), 'UCF-GV-001', 'Information Security Policy Framework',
 'The organization establishes, maintains, and enforces a comprehensive information security policy framework that defines security objectives, principles, responsibilities, and requirements approved by senior management.',
 'Governance', 'Policy',
 'Develop a hierarchical policy framework: top-level information security policy, supporting topic-specific policies (access control, data protection, incident response, etc.), standards defining technical requirements, and procedures detailing operational steps. Policies must be approved by senior management, reviewed annually, communicated to all employees, and accessible in a central policy repository.',
 ARRAY['Information security policy document', 'Policy approval records', 'Annual policy review evidence', 'Policy acknowledgment records'],
 74, NOW(), NOW()),

(gen_random_uuid(), 'UCF-GV-002', 'Security Roles and Responsibilities',
 'The organization defines and assigns information security roles and responsibilities across all levels of the organization, ensuring clear accountability for security program management, control operation, and risk ownership.',
 'Governance', 'Roles and Responsibilities',
 'Define and document responsibilities for: CISO/security leadership, security team members, IT operations staff, system and data owners, managers, and all employees. Include security responsibilities in job descriptions and performance objectives. Establish a RACI matrix for key security processes. Ensure the CISO has a direct reporting line to senior executive leadership.',
 ARRAY['Security RACI matrix', 'Job descriptions with security responsibilities', 'Organizational chart showing CISO reporting line', 'Security roles and responsibilities documentation'],
 75, NOW(), NOW()),

(gen_random_uuid(), 'UCF-GV-003', 'Security Awareness and Training',
 'The organization implements a security awareness and training program that educates all personnel on security policies, threats, and their individual responsibilities, with role-specific training for personnel in specialized security functions.',
 'Governance', 'Training',
 'Deliver security awareness training to all employees upon hire and annually thereafter. Conduct monthly phishing simulations with targeted follow-up training for users who fail. Provide role-specific training for developers (secure coding), IT administrators (secure operations), and executives (risk governance). Track training completion rates with a target of 95%+ compliance.',
 ARRAY['Training program curriculum', 'Training completion records and rates', 'Phishing simulation results', 'Role-specific training materials and attendance'],
 76, NOW(), NOW()),

(gen_random_uuid(), 'UCF-GV-004', 'Board and Executive Oversight',
 'The board of directors or equivalent governing body exercises oversight of the information security program through regular briefings, risk review, budget approval, and strategic direction setting.',
 'Governance', 'Executive Oversight',
 'Brief the board or its designated committee on cybersecurity at least quarterly. Board briefings should cover: current risk posture, significant incidents, program maturity progress, regulatory compliance status, and budget adequacy. The board should review and approve the annual security strategy and budget. Document board-level security decisions and action items.',
 ARRAY['Board meeting minutes covering cybersecurity', 'Quarterly security briefing presentations', 'Board-approved security strategy', 'Board security committee charter'],
 77, NOW(), NOW()),

(gen_random_uuid(), 'UCF-GV-005', 'Compliance Monitoring',
 'The organization monitors compliance with applicable laws, regulations, contractual obligations, and internal security policies through regular assessments, automated compliance checking, and gap remediation tracking.',
 'Governance', 'Compliance',
 'Maintain an inventory of all applicable compliance requirements (regulations, standards, contractual commitments). Map compliance requirements to implemented controls. Conduct compliance assessments at least annually for each applicable framework. Track compliance gaps through remediation and report compliance posture to leadership. Automate compliance monitoring where feasible.',
 ARRAY['Compliance requirements inventory', 'Control-to-requirement mapping matrix', 'Compliance assessment reports', 'Gap remediation tracking records'],
 78, NOW(), NOW()),

(gen_random_uuid(), 'UCF-GV-006', 'Internal Audit of Security Controls',
 'The organization conducts internal audits of information security controls to independently assess their design adequacy and operational effectiveness, with findings tracked to remediation.',
 'Governance', 'Audit',
 'Establish an annual internal audit plan covering key security controls on a risk-based rotation. Auditors must be independent of the functions they audit. Audit procedures should assess both control design and operating effectiveness with sample-based testing. Issue formal audit findings with risk ratings. Track remediation with target dates and verify closure.',
 ARRAY['Internal audit plan', 'Audit reports with findings', 'Remediation action tracking', 'Audit finding closure verification records'],
 79, NOW(), NOW()),

(gen_random_uuid(), 'UCF-GV-007', 'Regulatory and Legal Tracking',
 'The organization monitors the regulatory and legal landscape to identify new or changed requirements affecting information security, privacy, and data protection, and assesses the impact on the compliance program.',
 'Governance', 'Regulatory',
 'Assign responsibility for regulatory monitoring to a designated individual or team. Subscribe to regulatory update services and industry associations. Assess the impact of new regulations on the organization within 30 days of publication. Maintain a regulatory change log tracking identified changes, impact assessments, and required compliance actions.',
 ARRAY['Regulatory monitoring procedures', 'Regulatory change log', 'Impact assessment records', 'Compliance action plans for new regulations'],
 80, NOW(), NOW()),

(gen_random_uuid(), 'UCF-GV-008', 'Ethics and Code of Conduct',
 'The organization establishes a code of conduct and ethics policy that sets expectations for acceptable use of information systems, confidentiality obligations, and consequences for policy violations, acknowledged by all personnel.',
 'Governance', 'Ethics',
 'Publish a code of conduct covering acceptable use of technology, data confidentiality, conflict of interest, reporting obligations, and consequences for violations. Require written acknowledgment from all employees upon hire and annually. Establish a confidential reporting mechanism (hotline, web portal) for ethics concerns. Investigate reported violations promptly.',
 ARRAY['Code of conduct document', 'Employee acknowledgment records', 'Ethics reporting mechanism documentation', 'Violation investigation records'],
 81, NOW(), NOW()),

(gen_random_uuid(), 'UCF-GV-009', 'Security Program Performance Measurement',
 'The organization measures and evaluates the performance and maturity of the information security program against defined objectives and industry benchmarks to drive continuous improvement.',
 'Governance', 'Performance',
 'Define security program objectives with measurable targets. Conduct annual security maturity assessments using a recognized framework (NIST CSF, CMMI, C2M2). Benchmark program performance against industry peers. Track year-over-year maturity improvement. Tie security program goals to business objectives and report on alignment to leadership.',
 ARRAY['Security program objectives and targets', 'Maturity assessment results', 'Year-over-year maturity trend reports', 'Benchmarking analysis documentation'],
 82, NOW(), NOW()),

(gen_random_uuid(), 'UCF-GV-010', 'Information Security Committee',
 'The organization establishes an information security steering committee or equivalent governance body composed of cross-functional leadership to provide strategic direction, prioritize initiatives, and resolve resource conflicts.',
 'Governance', 'Governance Bodies',
 'Charter a security steering committee with membership from IT, security, legal, compliance, HR, business unit leaders, and executive management. Meet at least quarterly to review: security program status, risk posture, major initiatives, budget, and policy changes. Document meeting agendas, minutes, decisions, and action items. Ensure the committee has authority to prioritize and fund security initiatives.',
 ARRAY['Committee charter', 'Meeting agendas and minutes', 'Decision and action item logs', 'Committee membership roster'],
 83, NOW(), NOW());


-- ============================================
-- 9. PHYSICAL SECURITY (UCF-PS-001 to UCF-PS-006)
-- ============================================
INSERT INTO ucf_controls (id, code, title, description, category, subcategory, guidance, typical_evidence_types, sort_order, created_at, updated_at) VALUES

(gen_random_uuid(), 'UCF-PS-001', 'Facility Access Controls',
 'The organization restricts physical access to facilities, server rooms, and sensitive areas using authentication mechanisms, with access granted based on job function and revoked promptly when no longer required.',
 'Physical Security', 'Access Control',
 'Implement badge-based or biometric access control for all building entry points and sensitive areas (server rooms, network closets, executive floors). Restrict data center access to authorized personnel with documented business need. Review physical access lists quarterly. Ensure access control systems log all entry and exit events with timestamps.',
 ARRAY['Physical access control system configuration', 'Access badge issuance and revocation logs', 'Quarterly access list review records', 'Physical access logs for sensitive areas'],
 84, NOW(), NOW()),

(gen_random_uuid(), 'UCF-PS-002', 'Visitor Management',
 'The organization controls and monitors visitor access to facilities through registration, identification, escort requirements, and access restrictions that prevent unauthorized physical access.',
 'Physical Security', 'Visitor Management',
 'Require all visitors to sign in at reception with government-issued identification. Issue temporary visitor badges that are visually distinct from employee badges. Require escorts for visitors in sensitive areas. Log visitor entry and exit times. Collect visitor badges upon departure. Retain visitor logs for a minimum of 90 days.',
 ARRAY['Visitor management policy', 'Visitor sign-in logs', 'Visitor badge procedures', 'Escort policy documentation'],
 85, NOW(), NOW()),

(gen_random_uuid(), 'UCF-PS-003', 'Environmental Controls',
 'The organization implements environmental controls to protect information systems and equipment from damage due to temperature, humidity, fire, water, and power disruptions.',
 'Physical Security', 'Environmental',
 'Install and maintain HVAC systems with temperature and humidity monitoring in server rooms (target 64-80F, 40-60% humidity). Deploy fire suppression systems (clean agent preferred) and smoke detection in data center spaces. Install water leak detection sensors under raised floors and near water sources. Implement uninterruptible power supplies (UPS) and generator backup for critical systems.',
 ARRAY['Environmental monitoring system configuration', 'Temperature and humidity monitoring logs', 'Fire suppression system inspection records', 'UPS and generator testing records'],
 86, NOW(), NOW()),

(gen_random_uuid(), 'UCF-PS-004', 'Equipment Security',
 'The organization protects information processing equipment from theft, unauthorized access, and environmental hazards through physical security measures, cable management, and secure placement.',
 'Physical Security', 'Equipment',
 'Secure servers in locked racks within access-controlled rooms. Lock laptop docking stations and provide cable locks for portable equipment. Maintain an asset inventory with physical location tracking. Require manager approval for equipment removal from premises. Implement asset tracking tags for all portable equipment.',
 ARRAY['Equipment security procedures', 'Server room access controls', 'Asset inventory with locations', 'Equipment removal authorization records'],
 87, NOW(), NOW()),

(gen_random_uuid(), 'UCF-PS-005', 'Secure Media and Equipment Disposal',
 'The organization securely disposes of or sanitizes physical media and equipment containing sensitive data before disposal, reuse, or transfer, preventing data recovery from decommissioned assets.',
 'Physical Security', 'Disposal',
 'Degauss or physically destroy magnetic media. Use certified shredding for paper documents containing sensitive data. Wipe or destroy solid-state drives using manufacturer-approved secure erase methods. Obtain certificates of destruction from disposal vendors. Maintain disposal logs recording asset identifier, sanitization method, date, and responsible person.',
 ARRAY['Media disposal procedures', 'Certificates of destruction', 'Disposal logs', 'Disposal vendor agreements and certifications'],
 88, NOW(), NOW()),

(gen_random_uuid(), 'UCF-PS-006', 'Surveillance and Physical Monitoring',
 'The organization monitors facilities through surveillance systems including cameras, intrusion detection, and security personnel to detect, deter, and record unauthorized physical access attempts.',
 'Physical Security', 'Surveillance',
 'Install CCTV cameras at building entrances, parking areas, server room entries, and sensitive area access points. Retain surveillance footage for a minimum of 90 days. Monitor intrusion detection alarms with 24/7 response capability. Test alarm systems quarterly. Conduct periodic security patrols of facilities during non-business hours.',
 ARRAY['CCTV camera placement maps', 'Surveillance footage retention settings', 'Intrusion detection system configuration', 'Security patrol logs and alarm test records'],
 89, NOW(), NOW());


-- ============================================
-- 10. NETWORK SECURITY (UCF-NS-001 to UCF-NS-008)
-- ============================================
INSERT INTO ucf_controls (id, code, title, description, category, subcategory, guidance, typical_evidence_types, sort_order, created_at, updated_at) VALUES

(gen_random_uuid(), 'UCF-NS-001', 'Firewall Management',
 'The organization deploys and manages firewalls at network boundaries and between security zones, with documented rule sets that enforce the principle of least privilege and are reviewed regularly for accuracy and necessity.',
 'Network Security', 'Perimeter Security',
 'Deploy firewalls at all network perimeters and between security zones (DMZ, production, development, management). Implement a default-deny rule set allowing only explicitly authorized traffic. Review firewall rules at least quarterly and remove obsolete or overly permissive rules. Require change management approval for all firewall rule modifications. Log all denied traffic.',
 ARRAY['Firewall architecture diagrams', 'Firewall rule sets', 'Quarterly rule review records', 'Firewall change request tickets'],
 90, NOW(), NOW()),

(gen_random_uuid(), 'UCF-NS-002', 'Network Segmentation',
 'The organization segments the network into security zones based on data sensitivity and system function, restricting lateral movement and limiting the blast radius of security incidents.',
 'Network Security', 'Segmentation',
 'Segment networks into distinct zones: public-facing DMZ, internal corporate, production workloads, development/test, management, and PCI/regulated data zones. Implement micro-segmentation for cloud workloads. Enforce strict access controls between zones with firewall rules and access control lists. Document the segmentation architecture and authorized inter-zone traffic flows.',
 ARRAY['Network segmentation architecture diagrams', 'VLAN and subnet documentation', 'Inter-zone access control lists', 'Micro-segmentation configuration records'],
 91, NOW(), NOW()),

(gen_random_uuid(), 'UCF-NS-003', 'Intrusion Detection and Prevention',
 'The organization deploys intrusion detection and prevention systems (IDS/IPS) to monitor network traffic for known attack signatures and anomalous behavior, with alerts routed to the security operations team.',
 'Network Security', 'Threat Detection',
 'Deploy network IDS/IPS at key monitoring points: internet ingress/egress, between major network segments, and at data center boundaries. Keep detection signatures updated at least daily. Tune IDS/IPS rules to minimize false positives while maintaining detection coverage. Integrate IDS/IPS alerts with the SIEM. Review and update placement based on network architecture changes.',
 ARRAY['IDS/IPS deployment architecture', 'Signature update logs', 'Alert tuning records', 'IDS/IPS detection and alert reports'],
 92, NOW(), NOW()),

(gen_random_uuid(), 'UCF-NS-004', 'VPN and Secure Remote Connectivity',
 'The organization secures remote network access through VPN or zero-trust network access (ZTNA) solutions that encrypt traffic, authenticate users, and enforce access policies before granting network connectivity.',
 'Network Security', 'Remote Connectivity',
 'Deploy enterprise VPN or ZTNA for all remote access to internal resources. Require strong encryption (AES-256 for data, TLS 1.2+ for control channel). Enforce MFA for all VPN/ZTNA sessions. Implement split tunneling policies that route corporate traffic through the VPN while allowing direct internet access for non-sensitive traffic. Monitor and log all VPN connections.',
 ARRAY['VPN/ZTNA architecture documentation', 'VPN encryption configuration', 'VPN connection logs', 'Split tunnel policy documentation'],
 93, NOW(), NOW()),

(gen_random_uuid(), 'UCF-NS-005', 'Wireless Network Security',
 'The organization secures wireless networks through strong encryption, authentication, and segmentation, preventing unauthorized devices from connecting to corporate wireless infrastructure.',
 'Network Security', 'Wireless Security',
 'Use WPA3-Enterprise (or minimum WPA2-Enterprise with AES) for corporate wireless networks. Authenticate wireless connections through 802.1X with certificate or credential-based authentication. Segment guest wireless networks from corporate networks. Disable SSID broadcasting for sensitive wireless networks if operationally feasible. Conduct periodic rogue access point scans.',
 ARRAY['Wireless security configuration documentation', 'Wireless authentication settings', 'Guest network segmentation verification', 'Rogue access point scan results'],
 94, NOW(), NOW()),

(gen_random_uuid(), 'UCF-NS-006', 'DNS Security',
 'The organization implements DNS security controls including DNSSEC, DNS filtering, and DNS monitoring to prevent DNS-based attacks such as cache poisoning, tunneling, and domain hijacking.',
 'Network Security', 'DNS Security',
 'Implement DNS filtering to block resolution of known malicious domains. Deploy DNSSEC validation for external DNS resolution. Monitor DNS query logs for anomalous patterns indicating DNS tunneling or data exfiltration. Use internal DNS servers for corporate endpoints and restrict external DNS resolution. Protect DNS infrastructure from unauthorized modifications.',
 ARRAY['DNS filtering configuration', 'DNSSEC validation configuration', 'DNS monitoring and anomaly detection records', 'DNS query log analysis reports'],
 95, NOW(), NOW()),

(gen_random_uuid(), 'UCF-NS-007', 'DDoS Protection',
 'The organization implements controls to detect and mitigate distributed denial-of-service (DDoS) attacks that could disrupt the availability of public-facing services and network infrastructure.',
 'Network Security', 'Availability',
 'Deploy DDoS mitigation services (cloud-based scrubbing, CDN-based protection, or on-premise appliances) for all public-facing services. Configure rate limiting and connection throttling at load balancers. Establish DDoS response playbooks with ISP and mitigation provider escalation procedures. Conduct DDoS simulation testing annually to validate protection effectiveness.',
 ARRAY['DDoS mitigation service configuration', 'Rate limiting and throttling settings', 'DDoS response playbooks', 'DDoS simulation test results'],
 96, NOW(), NOW()),

(gen_random_uuid(), 'UCF-NS-008', 'Network Monitoring and Traffic Analysis',
 'The organization monitors network traffic for security anomalies, performance issues, and policy violations through flow analysis, packet capture capability, and network behavior analytics.',
 'Network Security', 'Monitoring',
 'Implement NetFlow/IPFIX collection from core network devices and analyze traffic patterns for anomalies. Deploy network detection and response (NDR) tools for encrypted traffic analysis. Maintain packet capture capability for forensic investigation. Monitor for unauthorized protocols, unexpected data flows, and communication with known-malicious IP addresses.',
 ARRAY['Network monitoring architecture', 'NetFlow/IPFIX collection configuration', 'Network anomaly detection reports', 'Network traffic analysis dashboards'],
 97, NOW(), NOW());


-- ============================================
-- 11. APPLICATION SECURITY (UCF-AS-001 to UCF-AS-008)
-- ============================================
INSERT INTO ucf_controls (id, code, title, description, category, subcategory, guidance, typical_evidence_types, sort_order, created_at, updated_at) VALUES

(gen_random_uuid(), 'UCF-AS-001', 'Secure Software Development Lifecycle',
 'The organization integrates security into every phase of the software development lifecycle (SDLC) including requirements, design, development, testing, deployment, and maintenance through defined security activities and gates.',
 'Application Security', 'SDLC',
 'Document a secure SDLC framework with security activities at each phase: threat modeling during design, secure coding guidelines during development, security testing before release, and security review during change management. Require security sign-off for production releases. Train all developers on the secure SDLC process annually.',
 ARRAY['Secure SDLC policy and framework document', 'Security gate checklists', 'Developer secure SDLC training records', 'Security sign-off records for releases'],
 98, NOW(), NOW()),

(gen_random_uuid(), 'UCF-AS-002', 'Code Review and Security Review',
 'The organization requires peer code review for all production code changes and security-focused review for changes affecting security-sensitive functionality, authentication, authorization, and data handling.',
 'Application Security', 'Code Review',
 'Require at least one peer code review approval before merging to main branches. Mandate security team review for changes to authentication, authorization, cryptography, session management, and sensitive data handling modules. Use code review checklists that include security-specific items. Track code review coverage and exception rates.',
 ARRAY['Code review policy', 'Pull request review records', 'Security review checklist', 'Code review coverage metrics'],
 99, NOW(), NOW()),

(gen_random_uuid(), 'UCF-AS-003', 'Application Security Testing (SAST/DAST)',
 'The organization performs static application security testing (SAST) and dynamic application security testing (DAST) to identify vulnerabilities in application code and running applications before and after deployment.',
 'Application Security', 'Security Testing',
 'Integrate SAST into CI/CD pipelines to scan code on every build. Configure SAST to block builds with critical or high severity findings. Perform DAST scans against staging environments before production releases and periodically (at least quarterly) against production. Track and remediate all findings within defined SLAs aligned with vulnerability management policy.',
 ARRAY['SAST tool configuration and scan results', 'DAST scan reports', 'CI/CD pipeline security gate configuration', 'Finding remediation tracking records'],
 100, NOW(), NOW()),

(gen_random_uuid(), 'UCF-AS-004', 'API Security',
 'The organization secures application programming interfaces (APIs) through authentication, authorization, input validation, rate limiting, and monitoring to prevent abuse, data exposure, and injection attacks.',
 'Application Security', 'API Security',
 'Enforce authentication (OAuth 2.0, API keys) and authorization on all API endpoints. Implement input validation and output encoding for all API parameters. Apply rate limiting and throttling per client. Log all API requests with sufficient detail for security monitoring. Maintain an API inventory and deprecate unused APIs. Test APIs for OWASP API Security Top 10 vulnerabilities.',
 ARRAY['API security standards document', 'API inventory', 'API security test results', 'Rate limiting and authentication configuration'],
 101, NOW(), NOW()),

(gen_random_uuid(), 'UCF-AS-005', 'Input Validation and Output Encoding',
 'The organization implements comprehensive input validation and output encoding to prevent injection attacks (SQL injection, XSS, command injection) across all application interfaces.',
 'Application Security', 'Secure Coding',
 'Validate all input on the server side using allowlist validation where possible. Use parameterized queries or prepared statements for all database operations. Apply context-appropriate output encoding (HTML, URL, JavaScript, CSS) to prevent cross-site scripting. Implement Content Security Policy (CSP) headers. Never trust client-side validation alone.',
 ARRAY['Secure coding standards', 'Input validation implementation evidence', 'CSP header configuration', 'SAST findings related to injection vulnerabilities'],
 102, NOW(), NOW()),

(gen_random_uuid(), 'UCF-AS-006', 'Software Dependency Management',
 'The organization inventories, monitors, and manages third-party software dependencies (open source and commercial libraries) to identify and remediate known vulnerabilities in the software supply chain.',
 'Application Security', 'Supply Chain',
 'Maintain a software bill of materials (SBOM) for all applications. Integrate software composition analysis (SCA) tools into CI/CD pipelines to scan dependencies for known vulnerabilities. Define a policy for acceptable license types. Monitor dependency vulnerability databases continuously and remediate critical dependency vulnerabilities within 48 hours. Pin dependency versions and verify integrity.',
 ARRAY['Software bill of materials (SBOM)', 'SCA scan results', 'Dependency vulnerability remediation records', 'License compliance reports'],
 103, NOW(), NOW()),

(gen_random_uuid(), 'UCF-AS-007', 'Secure Deployment and Configuration',
 'The organization ensures applications are deployed securely with hardened configurations, security headers, appropriate permissions, and removal of debug features, default credentials, and unnecessary components.',
 'Application Security', 'Deployment',
 'Define secure deployment checklists covering: removal of debug modes and verbose error messages, disabling directory listing, configuring security headers (CSP, X-Frame-Options, HSTS, X-Content-Type-Options), removing default credentials and sample pages, and applying least-privilege permissions. Automate deployment configuration through infrastructure-as-code with security baselines enforced.',
 ARRAY['Secure deployment checklist', 'Security header configuration verification', 'Deployment automation scripts/templates', 'Production configuration audit results'],
 104, NOW(), NOW()),

(gen_random_uuid(), 'UCF-AS-008', 'Application Logging and Monitoring',
 'The organization implements security-relevant logging in applications to capture authentication events, authorization failures, input validation errors, and application errors, forwarded to the centralized log management system.',
 'Application Security', 'Logging',
 'Log security-relevant events including: successful and failed authentication, authorization failures, input validation failures, application errors, privilege changes, and data access to sensitive records. Include contextual data (user ID, source IP, timestamp, action, outcome) in each log entry. Do not log sensitive data (passwords, tokens, PII) in plain text. Forward application logs to the SIEM.',
 ARRAY['Application logging standards', 'Sample application log entries', 'SIEM integration configuration', 'Log content verification records'],
 105, NOW(), NOW());


-- ============================================
-- 12. VENDOR MANAGEMENT (UCF-VM-001 to UCF-VM-006)
-- ============================================
INSERT INTO ucf_controls (id, code, title, description, category, subcategory, guidance, typical_evidence_types, sort_order, created_at, updated_at) VALUES

(gen_random_uuid(), 'UCF-VM-001', 'Vendor Risk Assessment',
 'The organization conducts risk assessments of third-party vendors before engagement and periodically thereafter, evaluating security posture, data handling practices, and business continuity capabilities commensurate with the risk the vendor poses.',
 'Vendor Management', 'Risk Assessment',
 'Classify vendors by risk tier based on data access level, system integration depth, and business criticality. Require security questionnaires (SIG Lite or equivalent) for all vendors accessing confidential data. Review SOC 2 reports, ISO 27001 certifications, or equivalent for high-risk vendors. Conduct annual re-assessments for critical vendors and biennial for medium-risk vendors.',
 ARRAY['Vendor risk tiering criteria', 'Vendor security questionnaire responses', 'SOC 2 / ISO 27001 report reviews', 'Vendor risk assessment scorecards'],
 106, NOW(), NOW()),

(gen_random_uuid(), 'UCF-VM-002', 'Vendor Due Diligence',
 'The organization performs due diligence on prospective vendors before contract execution, verifying their financial stability, reputation, regulatory compliance, and ability to meet security and privacy requirements.',
 'Vendor Management', 'Due Diligence',
 'Conduct due diligence including: review of financial stability indicators, verification of relevant certifications and compliance attestations, assessment of security incident history, review of data processing locations and subprocessor usage, and evaluation of business continuity capabilities. Document due diligence findings and include them in vendor approval decisions.',
 ARRAY['Due diligence checklists', 'Financial stability assessments', 'Certification and compliance verification records', 'Due diligence approval documentation'],
 107, NOW(), NOW()),

(gen_random_uuid(), 'UCF-VM-003', 'Contract Security Requirements',
 'The organization includes information security, privacy, and compliance requirements in vendor contracts including data protection obligations, breach notification requirements, audit rights, and termination provisions.',
 'Vendor Management', 'Contracts',
 'Include standard security clauses in all vendor contracts covering: data protection and encryption requirements, breach notification timelines (no later than 48 hours), right to audit or request evidence of controls, data return and destruction upon termination, subprocessor approval requirements, compliance with applicable regulations, and liability for security incidents.',
 ARRAY['Standard security contract clauses', 'Executed contracts with security terms', 'Data processing agreements', 'Contract review and approval records'],
 108, NOW(), NOW()),

(gen_random_uuid(), 'UCF-VM-004', 'Ongoing Vendor Monitoring',
 'The organization continuously monitors critical vendors for changes in security posture, compliance status, financial health, and service delivery that could increase risk to the organization.',
 'Vendor Management', 'Monitoring',
 'Subscribe to vendor security rating services for continuous monitoring of critical vendors. Review vendor SOC reports annually upon issuance. Track vendor security incidents reported through breach notification or public disclosure. Monitor vendor financial health indicators. Conduct periodic vendor performance reviews including security SLA compliance.',
 ARRAY['Vendor security rating reports', 'Annual SOC report review records', 'Vendor incident tracking records', 'Vendor performance review documentation'],
 109, NOW(), NOW()),

(gen_random_uuid(), 'UCF-VM-005', 'Fourth-Party Risk Management',
 'The organization identifies and manages risks arising from vendors use of their own subcontractors and service providers (fourth parties) that may have access to organizational data or affect service delivery.',
 'Vendor Management', 'Fourth-Party Risk',
 'Require critical vendors to disclose their subprocessors and key subcontractors. Include contractual rights to approve or reject subprocessor changes. Assess fourth-party risk as part of vendor risk assessments, particularly for cloud service providers and data processors. Require vendors to demonstrate their own vendor management programs for high-risk fourth parties.',
 ARRAY['Subprocessor disclosure registers', 'Subprocessor approval records', 'Fourth-party risk assessment documentation', 'Contract clauses addressing subprocessor management'],
 110, NOW(), NOW()),

(gen_random_uuid(), 'UCF-VM-006', 'Vendor Offboarding',
 'The organization implements formal vendor offboarding procedures to ensure that data is returned or destroyed, access is revoked, and contractual obligations are fulfilled when vendor relationships are terminated.',
 'Vendor Management', 'Offboarding',
 'Define vendor offboarding procedures including: revocation of all vendor access (VPN, system accounts, badges) within 24 hours of termination, retrieval or certified destruction of all organizational data held by the vendor, return of organizational equipment and assets, confirmation of data deletion in writing, and decommissioning of vendor integrations and API connections.',
 ARRAY['Vendor offboarding checklist', 'Access revocation confirmation records', 'Data destruction certificates from vendors', 'Offboarding completion sign-off records'],
 111, NOW(), NOW());


-- ============================================
-- 13. PRIVACY (UCF-PV-001 to UCF-PV-009)
-- ============================================
INSERT INTO ucf_controls (id, code, title, description, category, subcategory, guidance, typical_evidence_types, sort_order, created_at, updated_at) VALUES

(gen_random_uuid(), 'UCF-PV-001', 'Privacy Notice and Transparency',
 'The organization publishes clear, accurate privacy notices that inform individuals about what personal data is collected, the purposes of processing, data sharing practices, retention periods, and their rights.',
 'Privacy', 'Transparency',
 'Publish a comprehensive privacy notice on the organization website and at all points of personal data collection. Ensure privacy notices are written in plain language accessible to the target audience. Update privacy notices when data practices change. Notify individuals of material changes to privacy practices before the changes take effect. Maintain version history of privacy notices.',
 ARRAY['Privacy notice documents', 'Privacy notice publication records', 'Privacy notice change log', 'Notification records for material changes'],
 112, NOW(), NOW()),

(gen_random_uuid(), 'UCF-PV-002', 'Consent Management',
 'The organization obtains, records, and manages consent from individuals for the processing of their personal data where consent is the legal basis, providing mechanisms to withdraw consent as easily as it was given.',
 'Privacy', 'Consent',
 'Implement a consent management platform that records: who consented, when, what they consented to, and the specific version of the privacy notice presented. Provide granular consent options allowing individuals to consent to specific processing purposes independently. Implement straightforward consent withdrawal mechanisms. Process withdrawal requests within 48 hours.',
 ARRAY['Consent management platform configuration', 'Consent records with timestamps', 'Consent withdrawal mechanism documentation', 'Consent withdrawal processing records'],
 113, NOW(), NOW()),

(gen_random_uuid(), 'UCF-PV-003', 'Data Subject Rights Management',
 'The organization establishes processes to receive, verify, and fulfill data subject rights requests including access, rectification, erasure, portability, and restriction of processing within regulatory timeframes.',
 'Privacy', 'Data Subject Rights',
 'Implement a data subject request (DSR) intake portal or email address. Define verification procedures to authenticate requestor identity before fulfilling requests. Establish workflows to locate all personal data across systems for each request type. Fulfill DSR requests within 30 days (or applicable regulatory timeframe). Maintain a DSR log tracking all requests and outcomes.',
 ARRAY['DSR intake process documentation', 'Identity verification procedures', 'DSR tracking log', 'DSR fulfillment records with response times'],
 114, NOW(), NOW()),

(gen_random_uuid(), 'UCF-PV-004', 'Data Processing Agreements',
 'The organization executes data processing agreements (DPAs) with all vendors and partners that process personal data on the organization behalf, defining processing scope, security obligations, and regulatory compliance requirements.',
 'Privacy', 'Data Processing',
 'Execute DPAs with all data processors before sharing personal data. DPAs must include: scope and purpose of processing, data categories and subject types, processor security obligations, breach notification requirements, subprocessor restrictions, data return and deletion obligations, and audit rights. Use Standard Contractual Clauses (SCCs) for international transfers where required.',
 ARRAY['Executed data processing agreements', 'DPA template and standard clauses', 'DPA tracking register', 'Standard Contractual Clauses where applicable'],
 115, NOW(), NOW()),

(gen_random_uuid(), 'UCF-PV-005', 'Privacy Impact Assessment',
 'The organization conducts privacy impact assessments (PIAs) or data protection impact assessments (DPIAs) for new projects, systems, and processing activities that involve personal data, identifying and mitigating privacy risks before implementation.',
 'Privacy', 'Impact Assessment',
 'Require PIAs for all new systems processing personal data, changes to existing data processing, new data sharing arrangements, and implementation of new surveillance or profiling technologies. Define PIA triggers and thresholds. Include data protection officer review for high-risk processing. Track PIA recommendations through implementation.',
 ARRAY['PIA/DPIA templates', 'Completed PIA reports', 'PIA trigger criteria documentation', 'PIA recommendation tracking records'],
 116, NOW(), NOW()),

(gen_random_uuid(), 'UCF-PV-006', 'Cross-Border Data Transfer Controls',
 'The organization ensures that personal data transferred to other jurisdictions is protected through appropriate legal mechanisms and adequate safeguards in compliance with applicable data transfer regulations.',
 'Privacy', 'Data Transfers',
 'Identify all cross-border personal data transfers and document the legal basis for each (adequacy decisions, SCCs, binding corporate rules, or valid derogations). Conduct transfer impact assessments to evaluate data protection in recipient jurisdictions. Implement supplementary technical measures (encryption, pseudonymization) where legal protections are insufficient.',
 ARRAY['Data transfer mapping inventory', 'Transfer legal basis documentation', 'Transfer impact assessments', 'Supplementary technical measure documentation'],
 117, NOW(), NOW()),

(gen_random_uuid(), 'UCF-PV-007', 'Data Breach Notification',
 'The organization maintains procedures to assess personal data breaches and notify supervisory authorities, affected individuals, and other required parties within applicable regulatory timeframes.',
 'Privacy', 'Breach Notification',
 'Define breach assessment procedures to evaluate whether a personal data breach is reportable (e.g., likely to result in risk to individual rights and freedoms). Establish notification workflows: supervisory authority notification within 72 hours (GDPR), individual notification without undue delay for high-risk breaches. Prepare notification templates. Maintain a breach register documenting all breaches and notification decisions.',
 ARRAY['Breach notification procedures', 'Notification templates', 'Breach register', 'Notification submission records with timestamps'],
 118, NOW(), NOW()),

(gen_random_uuid(), 'UCF-PV-008', 'Privacy by Design and Default',
 'The organization embeds privacy considerations into the design and architecture of systems, products, and business processes from inception, implementing data minimization and privacy-protective defaults.',
 'Privacy', 'Privacy Engineering',
 'Integrate privacy requirements into the SDLC alongside security requirements. Implement data minimization in system design: collect only necessary data, limit retention, restrict access. Configure systems with the most privacy-protective settings as defaults (opt-in rather than opt-out). Include privacy review in design reviews and architecture decisions for systems processing personal data.',
 ARRAY['Privacy by design guidelines', 'Privacy requirements in system design documents', 'Default privacy settings configuration', 'Privacy design review records'],
 119, NOW(), NOW()),

(gen_random_uuid(), 'UCF-PV-009', 'Record of Processing Activities',
 'The organization maintains a comprehensive, up-to-date record of personal data processing activities (ROPA) documenting all processing purposes, data categories, recipients, transfers, and retention periods as required by privacy regulations.',
 'Privacy', 'Documentation',
 'Maintain a ROPA covering: processing activity name and purpose, legal basis for processing, categories of data subjects and personal data, recipients and third-party disclosures, cross-border transfers and safeguards, retention periods, and technical/organizational security measures. Review and update the ROPA at least semi-annually and when processing activities change. Make the ROPA available to supervisory authorities upon request.',
 ARRAY['Record of processing activities (ROPA)', 'ROPA review and update records', 'ROPA maintenance procedures', 'Data flow diagrams supporting the ROPA'],
 120, NOW(), NOW());


-- ============================================
-- Summary: 120 UCF Controls
-- ============================================
-- Access Control:       15 controls (UCF-AC-001 to UCF-AC-015)
-- Change Management:    10 controls (UCF-CM-001 to UCF-CM-010)
-- Data Protection:      12 controls (UCF-DP-001 to UCF-DP-012)
-- Security Operations:  12 controls (UCF-SO-001 to UCF-SO-012)
-- Incident Response:     8 controls (UCF-IR-001 to UCF-IR-008)
-- Business Continuity:   8 controls (UCF-BC-001 to UCF-BC-008)
-- Risk Management:       8 controls (UCF-RM-001 to UCF-RM-008)
-- Governance:           10 controls (UCF-GV-001 to UCF-GV-010)
-- Physical Security:     6 controls (UCF-PS-001 to UCF-PS-006)
-- Network Security:      8 controls (UCF-NS-001 to UCF-NS-008)
-- Application Security:  8 controls (UCF-AS-001 to UCF-AS-008)
-- Vendor Management:     6 controls (UCF-VM-001 to UCF-VM-006)
-- Privacy:               9 controls (UCF-PV-001 to UCF-PV-009)
-- ============================================
-- Total:               120 controls
-- ============================================
