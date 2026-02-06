-- Additional Compliance Frameworks Seed Data
-- CIS Controls, NIST 800-53, COBIT, CMMC, FedRAMP, CSA CCM

-- ============================================
-- CIS Critical Security Controls v8
-- ============================================

INSERT INTO frameworks (id, code, name, version, authority, category, description, official_url)
VALUES (
    'f0000007-0000-0000-0000-000000000001',
    'CIS-CSC',
    'CIS Critical Security Controls',
    '8.0',
    'Center for Internet Security',
    'security',
    'The CIS Critical Security Controls are a prioritized set of actions that collectively form a defense-in-depth set of best practices that mitigate the most common attacks against systems and networks.',
    'https://www.cisecurity.org/controls'
) ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description;

-- CIS Controls Implementation Groups
INSERT INTO framework_domains (id, framework_id, code, name, description, display_order)
VALUES
    ('d0007001-0000-0000-0000-000000000001', 'f0000007-0000-0000-0000-000000000001', 'IG1', 'Implementation Group 1', 'Basic cyber hygiene - essential for all organizations', 1),
    ('d0007002-0000-0000-0000-000000000001', 'f0000007-0000-0000-0000-000000000001', 'IG2', 'Implementation Group 2', 'For organizations with moderate resources', 2),
    ('d0007003-0000-0000-0000-000000000001', 'f0000007-0000-0000-0000-000000000001', 'IG3', 'Implementation Group 3', 'For organizations with significant security capabilities', 3)
ON CONFLICT DO NOTHING;

-- CIS Controls v8 (18 controls)
INSERT INTO framework_requirements (framework_id, domain_id, code, name, description, guidance, evidence_requirements, evidence_examples)
VALUES
('f0000007-0000-0000-0000-000000000001', 'd0007001-0000-0000-0000-000000000001', 'CIS-1',
'Inventory and Control of Enterprise Assets',
'Actively manage all enterprise assets connected to the infrastructure, to accurately know the totality of assets that need to be monitored and protected.',
'Maintain comprehensive asset inventory.',
'Asset inventory, discovery tools, asset tracking.',
ARRAY['Asset Inventory', 'Discovery Scan Results', 'CMDB', 'Asset Tracking System']),

('f0000007-0000-0000-0000-000000000001', 'd0007001-0000-0000-0000-000000000001', 'CIS-2',
'Inventory and Control of Software Assets',
'Actively manage all software on the network so that only authorized software is installed and can execute.',
'Maintain software inventory and control unauthorized software.',
'Software inventory, application whitelisting.',
ARRAY['Software Inventory', 'Application Whitelist', 'License Management', 'Unauthorized Software Detection']),

('f0000007-0000-0000-0000-000000000001', 'd0007001-0000-0000-0000-000000000001', 'CIS-3',
'Data Protection',
'Develop processes and technical controls to identify, classify, securely handle, retain, and dispose of data.',
'Implement data protection controls.',
'Data classification, encryption, DLP.',
ARRAY['Data Classification Policy', 'Encryption Standards', 'DLP Configurations', 'Data Handling Procedures']),

('f0000007-0000-0000-0000-000000000001', 'd0007001-0000-0000-0000-000000000001', 'CIS-4',
'Secure Configuration of Enterprise Assets and Software',
'Establish and maintain the secure configuration of enterprise assets and software.',
'Apply secure configurations.',
'Configuration baselines, hardening guides.',
ARRAY['Configuration Baselines', 'Hardening Guides', 'Configuration Compliance Scans', 'CIS Benchmark Results']),

('f0000007-0000-0000-0000-000000000001', 'd0007001-0000-0000-0000-000000000001', 'CIS-5',
'Account Management',
'Use processes and tools to assign and manage authorization to credentials for user accounts.',
'Manage user accounts securely.',
'Account management procedures, access reviews.',
ARRAY['Account Management Policy', 'Access Reviews', 'Provisioning Procedures', 'Account Inventory']),

('f0000007-0000-0000-0000-000000000001', 'd0007001-0000-0000-0000-000000000001', 'CIS-6',
'Access Control Management',
'Use processes and tools to create, assign, manage, and revoke access credentials and privileges.',
'Implement access controls.',
'Access control policies, RBAC, least privilege.',
ARRAY['Access Control Policy', 'RBAC Configurations', 'Privilege Reviews', 'Access Logs']),

('f0000007-0000-0000-0000-000000000001', 'd0007001-0000-0000-0000-000000000001', 'CIS-7',
'Continuous Vulnerability Management',
'Develop a plan to continuously assess and track vulnerabilities on all enterprise assets.',
'Manage vulnerabilities continuously.',
'Vulnerability scanning, remediation tracking.',
ARRAY['Vulnerability Scan Reports', 'Remediation Tracking', 'Patch Management', 'Vulnerability Metrics']),

('f0000007-0000-0000-0000-000000000001', 'd0007002-0000-0000-0000-000000000001', 'CIS-8',
'Audit Log Management',
'Collect, alert, review, and retain audit logs of events that could help detect, understand, or recover from an attack.',
'Manage audit logs effectively.',
'Log collection, SIEM, log retention.',
ARRAY['Log Collection Configurations', 'SIEM Dashboards', 'Log Retention Policy', 'Alert Rules']),

('f0000007-0000-0000-0000-000000000001', 'd0007002-0000-0000-0000-000000000001', 'CIS-9',
'Email and Web Browser Protections',
'Improve protections and detections of threats from email and web vectors.',
'Protect email and web.',
'Email security, web filtering, browser security.',
ARRAY['Email Security Configurations', 'Web Filter Policies', 'Browser Configurations', 'Phishing Protection']),

('f0000007-0000-0000-0000-000000000001', 'd0007002-0000-0000-0000-000000000001', 'CIS-10',
'Malware Defenses',
'Prevent or control the installation, spread, and execution of malicious applications, code, or scripts.',
'Deploy malware defenses.',
'Antimalware, EDR, malware prevention.',
ARRAY['Antimalware Configurations', 'EDR Deployments', 'Malware Prevention Rules', 'Detection Logs']),

('f0000007-0000-0000-0000-000000000001', 'd0007002-0000-0000-0000-000000000001', 'CIS-11',
'Data Recovery',
'Establish and maintain data recovery practices sufficient to restore in-scope enterprise assets to a pre-incident and trusted state.',
'Implement data recovery.',
'Backup procedures, recovery testing.',
ARRAY['Backup Procedures', 'Recovery Testing Results', 'Backup Verification', 'Recovery Time Metrics']),

('f0000007-0000-0000-0000-000000000001', 'd0007002-0000-0000-0000-000000000001', 'CIS-12',
'Network Infrastructure Management',
'Establish and maintain the secure configuration of network devices.',
'Secure network infrastructure.',
'Network device configurations, segmentation.',
ARRAY['Network Device Configurations', 'Segmentation Documentation', 'Firewall Rules', 'Network Hardening']),

('f0000007-0000-0000-0000-000000000001', 'd0007002-0000-0000-0000-000000000001', 'CIS-13',
'Network Monitoring and Defense',
'Operate processes and tooling to establish and maintain comprehensive network monitoring and defense.',
'Monitor and defend networks.',
'Network monitoring, IDS/IPS, traffic analysis.',
ARRAY['Network Monitoring Tools', 'IDS/IPS Configurations', 'Traffic Analysis', 'Alert Dashboards']),

('f0000007-0000-0000-0000-000000000001', 'd0007001-0000-0000-0000-000000000001', 'CIS-14',
'Security Awareness and Skills Training',
'Establish and maintain a security awareness program to influence behavior among the workforce.',
'Provide security training.',
'Awareness program, training records.',
ARRAY['Security Awareness Program', 'Training Materials', 'Training Completion Records', 'Phishing Simulations']),

('f0000007-0000-0000-0000-000000000001', 'd0007002-0000-0000-0000-000000000001', 'CIS-15',
'Service Provider Management',
'Develop a process to evaluate service providers who hold sensitive data or are responsible for critical IT platforms.',
'Manage service provider risks.',
'Vendor assessments, contracts, monitoring.',
ARRAY['Vendor Risk Assessments', 'Security Requirements', 'Contract Reviews', 'Ongoing Monitoring']),

('f0000007-0000-0000-0000-000000000001', 'd0007003-0000-0000-0000-000000000001', 'CIS-16',
'Application Software Security',
'Manage the security life cycle of in-house developed, hosted, or acquired software.',
'Secure application development.',
'SDLC security, code review, testing.',
ARRAY['Secure SDLC', 'Code Review Records', 'Security Testing', 'Vulnerability Management']),

('f0000007-0000-0000-0000-000000000001', 'd0007002-0000-0000-0000-000000000001', 'CIS-17',
'Incident Response Management',
'Establish a program to develop and maintain an incident response capability.',
'Manage incident response.',
'IR plan, IR team, incident handling.',
ARRAY['Incident Response Plan', 'IR Team Roster', 'Incident Records', 'Response Procedures']),

('f0000007-0000-0000-0000-000000000001', 'd0007003-0000-0000-0000-000000000001', 'CIS-18',
'Penetration Testing',
'Test the effectiveness and resiliency of enterprise assets through identifying and exploiting weaknesses in controls.',
'Conduct penetration testing.',
'Penetration testing, red team exercises.',
ARRAY['Penetration Test Reports', 'Red Team Results', 'Remediation Evidence', 'Testing Schedules'])

ON CONFLICT (framework_id, code) DO UPDATE SET
    description = EXCLUDED.description,
    guidance = EXCLUDED.guidance,
    evidence_requirements = EXCLUDED.evidence_requirements,
    evidence_examples = EXCLUDED.evidence_examples;


-- ============================================
-- CMMC 2.0 (Cybersecurity Maturity Model Certification)
-- ============================================

INSERT INTO frameworks (id, code, name, version, authority, category, description, official_url)
VALUES (
    'f0000008-0000-0000-0000-000000000001',
    'CMMC',
    'Cybersecurity Maturity Model Certification',
    '2.0',
    'U.S. Department of Defense',
    'security',
    'CMMC 2.0 is a unified standard for implementing cybersecurity across the Defense Industrial Base (DIB). It measures cybersecurity maturity with three certification levels.',
    'https://www.acq.osd.mil/cmmc/'
) ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description;

-- CMMC Levels
INSERT INTO framework_domains (id, framework_id, code, name, description, display_order)
VALUES
    ('d0008001-0000-0000-0000-000000000001', 'f0000008-0000-0000-0000-000000000001', 'L1', 'Level 1 - Foundational', 'Basic safeguarding of FCI (17 practices)', 1),
    ('d0008002-0000-0000-0000-000000000001', 'f0000008-0000-0000-0000-000000000001', 'L2', 'Level 2 - Advanced', 'Protection of CUI aligned with NIST 800-171 (110 practices)', 2),
    ('d0008003-0000-0000-0000-000000000001', 'f0000008-0000-0000-0000-000000000001', 'L3', 'Level 3 - Expert', 'Enhanced protection against APTs (130+ practices)', 3)
ON CONFLICT DO NOTHING;


-- ============================================
-- CSA Cloud Controls Matrix (CCM)
-- ============================================

INSERT INTO frameworks (id, code, name, version, authority, category, description, official_url)
VALUES (
    'f0000009-0000-0000-0000-000000000001',
    'CSA-CCM',
    'CSA Cloud Controls Matrix',
    '4.0',
    'Cloud Security Alliance',
    'security',
    'The Cloud Controls Matrix (CCM) is a cybersecurity control framework for cloud computing. It is composed of 197 control objectives structured in 17 domains covering all key aspects of cloud technology.',
    'https://cloudsecurityalliance.org/research/cloud-controls-matrix/'
) ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description;

-- CSA CCM Domains
INSERT INTO framework_domains (id, framework_id, code, name, description, display_order)
VALUES
    ('d0009001-0000-0000-0000-000000000001', 'f0000009-0000-0000-0000-000000000001', 'A&A', 'Audit & Assurance', 'Audit and assurance controls', 1),
    ('d0009002-0000-0000-0000-000000000001', 'f0000009-0000-0000-0000-000000000001', 'AIS', 'Application & Interface Security', 'Application security controls', 2),
    ('d0009003-0000-0000-0000-000000000001', 'f0000009-0000-0000-0000-000000000001', 'BCR', 'Business Continuity Management & Operational Resilience', 'BCM controls', 3),
    ('d0009004-0000-0000-0000-000000000001', 'f0000009-0000-0000-0000-000000000001', 'CCC', 'Change Control & Configuration Management', 'Change management controls', 4),
    ('d0009005-0000-0000-0000-000000000001', 'f0000009-0000-0000-0000-000000000001', 'CEK', 'Cryptography, Encryption & Key Management', 'Encryption controls', 5),
    ('d0009006-0000-0000-0000-000000000001', 'f0000009-0000-0000-0000-000000000001', 'DCS', 'Datacenter Security', 'Physical security controls', 6),
    ('d0009007-0000-0000-0000-000000000001', 'f0000009-0000-0000-0000-000000000001', 'DSP', 'Data Security & Privacy Lifecycle Management', 'Data protection controls', 7),
    ('d0009008-0000-0000-0000-000000000001', 'f0000009-0000-0000-0000-000000000001', 'GRC', 'Governance, Risk & Compliance', 'GRC controls', 8),
    ('d0009009-0000-0000-0000-000000000001', 'f0000009-0000-0000-0000-000000000001', 'HRS', 'Human Resources', 'Personnel security controls', 9),
    ('d0009010-0000-0000-0000-000000000001', 'f0000009-0000-0000-0000-000000000001', 'IAM', 'Identity & Access Management', 'Access controls', 10),
    ('d0009011-0000-0000-0000-000000000001', 'f0000009-0000-0000-0000-000000000001', 'IPY', 'Interoperability & Portability', 'Interoperability controls', 11),
    ('d0009012-0000-0000-0000-000000000001', 'f0000009-0000-0000-0000-000000000001', 'IVS', 'Infrastructure & Virtualization Security', 'Infrastructure security controls', 12),
    ('d0009013-0000-0000-0000-000000000001', 'f0000009-0000-0000-0000-000000000001', 'LOG', 'Logging & Monitoring', 'Logging controls', 13),
    ('d0009014-0000-0000-0000-000000000001', 'f0000009-0000-0000-0000-000000000001', 'SEF', 'Security Incident Management, E-Discovery, & Cloud Forensics', 'Incident management controls', 14),
    ('d0009015-0000-0000-0000-000000000001', 'f0000009-0000-0000-0000-000000000001', 'STA', 'Supply Chain Management, Transparency, & Accountability', 'Supply chain controls', 15),
    ('d0009016-0000-0000-0000-000000000001', 'f0000009-0000-0000-0000-000000000001', 'TVM', 'Threat & Vulnerability Management', 'Vulnerability management controls', 16),
    ('d0009017-0000-0000-0000-000000000001', 'f0000009-0000-0000-0000-000000000001', 'UEM', 'Universal Endpoint Management', 'Endpoint management controls', 17)
ON CONFLICT DO NOTHING;


-- ============================================
-- ISO 22301 Business Continuity
-- ============================================

INSERT INTO frameworks (id, code, name, version, authority, category, description, official_url)
VALUES (
    'f0000010-0000-0000-0000-000000000001',
    'ISO22301',
    'ISO 22301 Business Continuity',
    '2019',
    'ISO',
    'security',
    'ISO 22301 specifies requirements to plan, establish, implement, operate, monitor, review, maintain and continually improve a documented management system to protect against, reduce the likelihood of occurrence, prepare for, respond to, and recover from disruptive incidents.',
    'https://www.iso.org/standard/75106.html'
) ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description;


-- ============================================
-- ISO 27701 Privacy Information Management
-- ============================================

INSERT INTO frameworks (id, code, name, version, authority, category, description, official_url)
VALUES (
    'f0000011-0000-0000-0000-000000000001',
    'ISO27701',
    'ISO 27701 Privacy Information Management',
    '2019',
    'ISO',
    'privacy',
    'ISO 27701 is an extension to ISO 27001 and ISO 27002 for privacy information management. It specifies requirements and provides guidance for establishing, implementing, maintaining and continually improving a Privacy Information Management System (PIMS).',
    'https://www.iso.org/standard/71670.html'
) ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description;


-- ============================================
-- NIST 800-171 (Protecting CUI)
-- ============================================

INSERT INTO frameworks (id, code, name, version, authority, category, description, official_url)
VALUES (
    'f0000012-0000-0000-0000-000000000001',
    'NIST-800-171',
    'NIST SP 800-171',
    'Rev 2',
    'NIST',
    'security',
    'NIST Special Publication 800-171 provides federal agencies with guidelines for protecting Controlled Unclassified Information (CUI) in nonfederal systems and organizations.',
    'https://csrc.nist.gov/publications/detail/sp/800-171/rev-2/final'
) ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description;

-- NIST 800-171 Families
INSERT INTO framework_domains (id, framework_id, code, name, description, display_order)
VALUES
    ('d0012001-0000-0000-0000-000000000001', 'f0000012-0000-0000-0000-000000000001', '3.1', 'Access Control', 'Limit system access to authorized users', 1),
    ('d0012002-0000-0000-0000-000000000001', 'f0000012-0000-0000-0000-000000000001', '3.2', 'Awareness and Training', 'Ensure personnel are aware of security risks', 2),
    ('d0012003-0000-0000-0000-000000000001', 'f0000012-0000-0000-0000-000000000001', '3.3', 'Audit and Accountability', 'Create and retain system audit logs', 3),
    ('d0012004-0000-0000-0000-000000000001', 'f0000012-0000-0000-0000-000000000001', '3.4', 'Configuration Management', 'Establish and maintain baseline configurations', 4),
    ('d0012005-0000-0000-0000-000000000001', 'f0000012-0000-0000-0000-000000000001', '3.5', 'Identification and Authentication', 'Identify and authenticate users and devices', 5),
    ('d0012006-0000-0000-0000-000000000001', 'f0000012-0000-0000-0000-000000000001', '3.6', 'Incident Response', 'Establish incident handling capability', 6),
    ('d0012007-0000-0000-0000-000000000001', 'f0000012-0000-0000-0000-000000000001', '3.7', 'Maintenance', 'Perform maintenance on systems', 7),
    ('d0012008-0000-0000-0000-000000000001', 'f0000012-0000-0000-0000-000000000001', '3.8', 'Media Protection', 'Protect system media', 8),
    ('d0012009-0000-0000-0000-000000000001', 'f0000012-0000-0000-0000-000000000001', '3.9', 'Personnel Security', 'Screen individuals prior to access', 9),
    ('d0012010-0000-0000-0000-000000000001', 'f0000012-0000-0000-0000-000000000001', '3.10', 'Physical Protection', 'Limit physical access to systems', 10),
    ('d0012011-0000-0000-0000-000000000001', 'f0000012-0000-0000-0000-000000000001', '3.11', 'Risk Assessment', 'Periodically assess security risks', 11),
    ('d0012012-0000-0000-0000-000000000001', 'f0000012-0000-0000-0000-000000000001', '3.12', 'Security Assessment', 'Assess security controls periodically', 12),
    ('d0012013-0000-0000-0000-000000000001', 'f0000012-0000-0000-0000-000000000001', '3.13', 'System and Communications Protection', 'Monitor and control communications', 13),
    ('d0012014-0000-0000-0000-000000000001', 'f0000012-0000-0000-0000-000000000001', '3.14', 'System and Information Integrity', 'Identify and correct system flaws', 14)
ON CONFLICT DO NOTHING;


-- ============================================
-- COBIT 2019
-- ============================================

INSERT INTO frameworks (id, code, name, version, authority, category, description, official_url)
VALUES (
    'f0000013-0000-0000-0000-000000000001',
    'COBIT',
    'COBIT 2019',
    '2019',
    'ISACA',
    'security',
    'COBIT (Control Objectives for Information and Related Technologies) is a framework for the governance and management of enterprise information and technology, created by ISACA.',
    'https://www.isaca.org/resources/cobit'
) ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description;


-- ============================================
-- FedRAMP
-- ============================================

INSERT INTO frameworks (id, code, name, version, authority, category, description, official_url)
VALUES (
    'f0000014-0000-0000-0000-000000000001',
    'FedRAMP',
    'FedRAMP',
    '2024',
    'U.S. General Services Administration',
    'security',
    'The Federal Risk and Authorization Management Program (FedRAMP) provides a standardized approach to security authorizations for cloud product and service offerings used by U.S. federal agencies.',
    'https://www.fedramp.gov/'
) ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description;

-- FedRAMP Impact Levels
INSERT INTO framework_domains (id, framework_id, code, name, description, display_order)
VALUES
    ('d0014001-0000-0000-0000-000000000001', 'f0000014-0000-0000-0000-000000000001', 'LOW', 'Low Impact', 'Low impact level for federal systems', 1),
    ('d0014002-0000-0000-0000-000000000001', 'f0000014-0000-0000-0000-000000000001', 'MOD', 'Moderate Impact', 'Moderate impact level for federal systems', 2),
    ('d0014003-0000-0000-0000-000000000001', 'f0000014-0000-0000-0000-000000000001', 'HIGH', 'High Impact', 'High impact level for federal systems', 3)
ON CONFLICT DO NOTHING;


-- ============================================
-- SOX (Sarbanes-Oxley)
-- ============================================

INSERT INTO frameworks (id, code, name, version, authority, category, description, official_url)
VALUES (
    'f0000015-0000-0000-0000-000000000001',
    'SOX',
    'Sarbanes-Oxley Act (IT Controls)',
    '2002',
    'U.S. SEC',
    'industry',
    'The Sarbanes-Oxley Act (SOX) mandates strict reforms to improve financial disclosures and prevent accounting fraud. IT controls are essential for Section 404 compliance regarding internal controls over financial reporting.',
    'https://www.sec.gov/about/laws/soa2002.pdf'
) ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description;
