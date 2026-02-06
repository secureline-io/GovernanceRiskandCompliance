-- HIPAA and GDPR Seed Data

-- ============================================
-- HIPAA Security Rule
-- ============================================

INSERT INTO frameworks (id, code, name, version, authority, category, description, official_url)
VALUES (
    'f0000005-0000-0000-0000-000000000001',
    'HIPAA',
    'HIPAA Security Rule',
    '2013',
    'U.S. Department of Health and Human Services',
    'privacy',
    'The HIPAA Security Rule establishes national standards to protect individuals electronic personal health information (ePHI) that is created, received, used, or maintained by a covered entity.',
    'https://www.hhs.gov/hipaa/for-professionals/security/index.html'
) ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description;

-- HIPAA Security Rule Safeguards
INSERT INTO framework_domains (id, framework_id, code, name, description, display_order)
VALUES
    ('d0005001-0000-0000-0000-000000000001', 'f0000005-0000-0000-0000-000000000001', 'ADM', 'Administrative Safeguards', 'Administrative actions, policies, and procedures to manage security', 1),
    ('d0005002-0000-0000-0000-000000000001', 'f0000005-0000-0000-0000-000000000001', 'PHY', 'Physical Safeguards', 'Physical measures, policies, and procedures to protect electronic systems', 2),
    ('d0005003-0000-0000-0000-000000000001', 'f0000005-0000-0000-0000-000000000001', 'TEC', 'Technical Safeguards', 'Technology and policies to protect and control access to ePHI', 3),
    ('d0005004-0000-0000-0000-000000000001', 'f0000005-0000-0000-0000-000000000001', 'ORG', 'Organizational Requirements', 'Standards for business associate contracts and other organizational requirements', 4)
ON CONFLICT DO NOTHING;

-- HIPAA Security Rule Requirements
INSERT INTO framework_requirements (framework_id, domain_id, code, name, description, guidance, evidence_requirements, evidence_examples)
VALUES

-- Administrative Safeguards (164.308)
('f0000005-0000-0000-0000-000000000001', 'd0005001-0000-0000-0000-000000000001', '164.308(a)(1)',
'Security Management Process',
'Implement policies and procedures to prevent, detect, contain, and correct security violations.',
'Establish comprehensive security management program.',
'Security policies, risk analysis, sanction policy, activity review.',
ARRAY['Security Management Policy', 'Risk Analysis Report', 'Sanction Policy', 'Security Activity Reviews']),

('f0000005-0000-0000-0000-000000000001', 'd0005001-0000-0000-0000-000000000001', '164.308(a)(1)(ii)(A)',
'Risk Analysis',
'Conduct an accurate and thorough assessment of the potential risks and vulnerabilities to ePHI.',
'Perform comprehensive risk analysis.',
'Risk analysis methodology, risk assessment report.',
ARRAY['Risk Analysis Methodology', 'Risk Assessment Report', 'Vulnerability Assessment', 'Threat Analysis']),

('f0000005-0000-0000-0000-000000000001', 'd0005001-0000-0000-0000-000000000001', '164.308(a)(1)(ii)(B)',
'Risk Management',
'Implement security measures sufficient to reduce risks and vulnerabilities to a reasonable and appropriate level.',
'Implement risk mitigation measures.',
'Risk management plan, mitigation measures, remediation tracking.',
ARRAY['Risk Management Plan', 'Risk Mitigation Measures', 'Remediation Tracking', 'Security Controls']),

('f0000005-0000-0000-0000-000000000001', 'd0005001-0000-0000-0000-000000000001', '164.308(a)(2)',
'Assigned Security Responsibility',
'Identify the security official responsible for developing and implementing security policies and procedures.',
'Designate a security official.',
'Security official designation, responsibilities documentation.',
ARRAY['Security Official Designation', 'Job Description', 'Responsibilities Documentation', 'Organizational Chart']),

('f0000005-0000-0000-0000-000000000001', 'd0005001-0000-0000-0000-000000000001', '164.308(a)(3)',
'Workforce Security',
'Implement policies and procedures to ensure that all members of the workforce have appropriate access to ePHI.',
'Manage workforce access appropriately.',
'Access authorization, clearance procedures, termination procedures.',
ARRAY['Access Authorization Policy', 'Clearance Procedures', 'Termination Procedures', 'Access Provisioning Records']),

('f0000005-0000-0000-0000-000000000001', 'd0005001-0000-0000-0000-000000000001', '164.308(a)(4)',
'Information Access Management',
'Implement policies and procedures for authorizing access to ePHI.',
'Manage information access authorization.',
'Access management policy, authorization procedures.',
ARRAY['Information Access Policy', 'Access Authorization Procedures', 'Access Review Records', 'Privilege Management']),

('f0000005-0000-0000-0000-000000000001', 'd0005001-0000-0000-0000-000000000001', '164.308(a)(5)',
'Security Awareness and Training',
'Implement a security awareness and training program for all workforce members.',
'Provide security awareness training.',
'Training program, training records, awareness materials.',
ARRAY['Security Awareness Program', 'Training Materials', 'Training Records', 'Phishing Simulations']),

('f0000005-0000-0000-0000-000000000001', 'd0005001-0000-0000-0000-000000000001', '164.308(a)(6)',
'Security Incident Procedures',
'Implement policies and procedures to address security incidents.',
'Establish incident response procedures.',
'Incident response plan, incident tracking, reporting procedures.',
ARRAY['Incident Response Plan', 'Incident Tracking System', 'Incident Reports', 'Response Procedures']),

('f0000005-0000-0000-0000-000000000001', 'd0005001-0000-0000-0000-000000000001', '164.308(a)(7)',
'Contingency Plan',
'Establish policies and procedures for responding to an emergency that damages systems containing ePHI.',
'Develop contingency/disaster recovery plans.',
'Contingency plan, backup procedures, recovery testing.',
ARRAY['Contingency Plan', 'Data Backup Plan', 'Disaster Recovery Plan', 'Testing Results']),

('f0000005-0000-0000-0000-000000000001', 'd0005001-0000-0000-0000-000000000001', '164.308(a)(8)',
'Evaluation',
'Perform a periodic technical and nontechnical evaluation to establish the extent to which security policies and procedures meet requirements.',
'Conduct periodic security evaluations.',
'Evaluation procedures, evaluation reports.',
ARRAY['Evaluation Procedures', 'Evaluation Reports', 'Gap Analysis', 'Corrective Action Plans']),

-- Physical Safeguards (164.310)
('f0000005-0000-0000-0000-000000000001', 'd0005002-0000-0000-0000-000000000001', '164.310(a)',
'Facility Access Controls',
'Implement policies and procedures to limit physical access to electronic information systems and facilities.',
'Control facility access.',
'Facility access policy, access controls, access logs.',
ARRAY['Facility Access Policy', 'Physical Access Controls', 'Access Logs', 'Visitor Management']),

('f0000005-0000-0000-0000-000000000001', 'd0005002-0000-0000-0000-000000000001', '164.310(b)',
'Workstation Use',
'Implement policies and procedures that specify proper functions, physical attributes, and manner of use for workstations.',
'Define workstation use requirements.',
'Workstation use policy, security configurations.',
ARRAY['Workstation Use Policy', 'Workstation Security Configurations', 'Acceptable Use Policy', 'Physical Placement Guidelines']),

('f0000005-0000-0000-0000-000000000001', 'd0005002-0000-0000-0000-000000000001', '164.310(c)',
'Workstation Security',
'Implement physical safeguards for all workstations that access ePHI.',
'Secure workstations physically.',
'Workstation security measures, physical controls.',
ARRAY['Workstation Security Measures', 'Cable Locks', 'Screen Privacy Filters', 'Physical Access Restrictions']),

('f0000005-0000-0000-0000-000000000001', 'd0005002-0000-0000-0000-000000000001', '164.310(d)',
'Device and Media Controls',
'Implement policies and procedures governing receipt and removal of hardware and electronic media containing ePHI.',
'Control devices and media.',
'Media handling procedures, disposal procedures, tracking.',
ARRAY['Device/Media Policy', 'Media Disposal Procedures', 'Media Tracking', 'Destruction Certificates']),

-- Technical Safeguards (164.312)
('f0000005-0000-0000-0000-000000000001', 'd0005003-0000-0000-0000-000000000001', '164.312(a)',
'Access Control',
'Implement technical policies and procedures for electronic information systems that maintain ePHI to allow access only to authorized persons.',
'Implement technical access controls.',
'Access control configurations, unique user IDs, automatic logoff.',
ARRAY['Access Control Configurations', 'Unique User ID Evidence', 'Automatic Logoff Settings', 'Emergency Access Procedures']),

('f0000005-0000-0000-0000-000000000001', 'd0005003-0000-0000-0000-000000000001', '164.312(b)',
'Audit Controls',
'Implement hardware, software, and/or procedural mechanisms that record and examine activity in information systems that contain or use ePHI.',
'Implement audit logging.',
'Audit log configurations, log review procedures.',
ARRAY['Audit Log Configurations', 'Log Review Procedures', 'Audit Trail Reports', 'Monitoring Dashboards']),

('f0000005-0000-0000-0000-000000000001', 'd0005003-0000-0000-0000-000000000001', '164.312(c)',
'Integrity',
'Implement policies and procedures to protect ePHI from improper alteration or destruction.',
'Protect data integrity.',
'Integrity controls, validation mechanisms.',
ARRAY['Integrity Controls', 'Data Validation Mechanisms', 'Hash Verification', 'Change Detection']),

('f0000005-0000-0000-0000-000000000001', 'd0005003-0000-0000-0000-000000000001', '164.312(d)',
'Person or Entity Authentication',
'Implement procedures to verify that a person or entity seeking access to ePHI is the one claimed.',
'Authenticate users and entities.',
'Authentication mechanisms, MFA configurations.',
ARRAY['Authentication Procedures', 'MFA Configurations', 'Identity Verification', 'Authentication Logs']),

('f0000005-0000-0000-0000-000000000001', 'd0005003-0000-0000-0000-000000000001', '164.312(e)',
'Transmission Security',
'Implement technical security measures to guard against unauthorized access to ePHI transmitted over electronic communications networks.',
'Secure data transmission.',
'Encryption configurations, secure transmission protocols.',
ARRAY['Transmission Encryption', 'TLS Configurations', 'Secure Protocol Evidence', 'Network Security Controls']),

-- Organizational Requirements (164.314)
('f0000005-0000-0000-0000-000000000001', 'd0005004-0000-0000-0000-000000000001', '164.314(a)',
'Business Associate Contracts',
'A covered entity may permit a business associate to create, receive, maintain, or transmit ePHI only if the covered entity obtains satisfactory assurances through a business associate contract.',
'Execute BAAs with business associates.',
'Business associate agreements, due diligence.',
ARRAY['Business Associate Agreements', 'BA Due Diligence', 'BA Inventory', 'Contract Management Records'])

ON CONFLICT (framework_id, code) DO UPDATE SET
    description = EXCLUDED.description,
    guidance = EXCLUDED.guidance,
    evidence_requirements = EXCLUDED.evidence_requirements,
    evidence_examples = EXCLUDED.evidence_examples;


-- ============================================
-- GDPR (General Data Protection Regulation)
-- ============================================

INSERT INTO frameworks (id, code, name, version, authority, category, description, official_url)
VALUES (
    'f0000006-0000-0000-0000-000000000001',
    'GDPR',
    'General Data Protection Regulation',
    '2016/679',
    'European Union',
    'privacy',
    'The General Data Protection Regulation (GDPR) is a regulation in EU law on data protection and privacy in the European Union and the European Economic Area. It addresses the transfer of personal data outside the EU and EEA areas.',
    'https://gdpr.eu/'
) ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description;

-- GDPR Chapters/Principles
INSERT INTO framework_domains (id, framework_id, code, name, description, display_order)
VALUES
    ('d0006001-0000-0000-0000-000000000001', 'f0000006-0000-0000-0000-000000000001', 'PRIN', 'Principles', 'Core data protection principles', 1),
    ('d0006002-0000-0000-0000-000000000001', 'f0000006-0000-0000-0000-000000000001', 'RIGHTS', 'Data Subject Rights', 'Rights of individuals regarding their personal data', 2),
    ('d0006003-0000-0000-0000-000000000001', 'f0000006-0000-0000-0000-000000000001', 'CONT', 'Controller Obligations', 'Obligations of data controllers', 3),
    ('d0006004-0000-0000-0000-000000000001', 'f0000006-0000-0000-0000-000000000001', 'PROC', 'Processor Obligations', 'Obligations of data processors', 4),
    ('d0006005-0000-0000-0000-000000000001', 'f0000006-0000-0000-0000-000000000001', 'TRANS', 'Data Transfers', 'International data transfer requirements', 5),
    ('d0006006-0000-0000-0000-000000000001', 'f0000006-0000-0000-0000-000000000001', 'SEC', 'Security', 'Security of processing requirements', 6)
ON CONFLICT DO NOTHING;

-- GDPR Articles/Requirements
INSERT INTO framework_requirements (framework_id, domain_id, code, name, description, guidance, evidence_requirements, evidence_examples)
VALUES

-- Principles (Article 5)
('f0000006-0000-0000-0000-000000000001', 'd0006001-0000-0000-0000-000000000001', 'Art.5.1.a',
'Lawfulness, Fairness and Transparency',
'Personal data shall be processed lawfully, fairly and in a transparent manner in relation to the data subject.',
'Ensure lawful basis for processing and transparency.',
'Privacy notices, lawful basis documentation, consent records.',
ARRAY['Privacy Notice/Policy', 'Lawful Basis Register', 'Consent Records', 'Processing Transparency']),

('f0000006-0000-0000-0000-000000000001', 'd0006001-0000-0000-0000-000000000001', 'Art.5.1.b',
'Purpose Limitation',
'Personal data shall be collected for specified, explicit and legitimate purposes and not further processed in a manner that is incompatible with those purposes.',
'Limit processing to specified purposes.',
'Purpose documentation, processing limitations.',
ARRAY['Purpose Documentation', 'Processing Activity Records', 'Purpose Change Assessments', 'Compatibility Analysis']),

('f0000006-0000-0000-0000-000000000001', 'd0006001-0000-0000-0000-000000000001', 'Art.5.1.c',
'Data Minimisation',
'Personal data shall be adequate, relevant and limited to what is necessary in relation to the purposes for which they are processed.',
'Minimize data collection and retention.',
'Data minimization assessments, field-level reviews.',
ARRAY['Data Minimization Policy', 'Field Necessity Reviews', 'Data Audit Results', 'Collection Justifications']),

('f0000006-0000-0000-0000-000000000001', 'd0006001-0000-0000-0000-000000000001', 'Art.5.1.d',
'Accuracy',
'Personal data shall be accurate and, where necessary, kept up to date.',
'Maintain accurate personal data.',
'Data quality procedures, accuracy checks, update mechanisms.',
ARRAY['Data Quality Policy', 'Accuracy Procedures', 'Update Mechanisms', 'Correction Processes']),

('f0000006-0000-0000-0000-000000000001', 'd0006001-0000-0000-0000-000000000001', 'Art.5.1.e',
'Storage Limitation',
'Personal data shall be kept in a form which permits identification of data subjects for no longer than is necessary for the purposes.',
'Limit data retention periods.',
'Retention policy, deletion schedules, retention justifications.',
ARRAY['Retention Policy', 'Retention Schedule', 'Deletion Procedures', 'Retention Period Justifications']),

('f0000006-0000-0000-0000-000000000001', 'd0006001-0000-0000-0000-000000000001', 'Art.5.1.f',
'Integrity and Confidentiality',
'Personal data shall be processed in a manner that ensures appropriate security of the personal data.',
'Protect personal data with appropriate security.',
'Security measures, encryption, access controls.',
ARRAY['Security Measures Documentation', 'Encryption Evidence', 'Access Controls', 'Security Testing']),

('f0000006-0000-0000-0000-000000000001', 'd0006001-0000-0000-0000-000000000001', 'Art.5.2',
'Accountability',
'The controller shall be responsible for, and be able to demonstrate compliance with, the principles.',
'Demonstrate compliance with GDPR principles.',
'Compliance documentation, audit records, accountability measures.',
ARRAY['Compliance Documentation', 'Audit Records', 'DPO Reports', 'Accountability Framework']),

-- Data Subject Rights
('f0000006-0000-0000-0000-000000000001', 'd0006002-0000-0000-0000-000000000001', 'Art.13-14',
'Right to Information',
'Data subjects have the right to receive information about how their data is processed.',
'Provide clear privacy information.',
'Privacy notices, information provided at collection.',
ARRAY['Privacy Notice', 'Data Collection Notices', 'Information Provision Records', 'Layered Notices']),

('f0000006-0000-0000-0000-000000000001', 'd0006002-0000-0000-0000-000000000001', 'Art.15',
'Right of Access',
'Data subjects have the right to obtain confirmation of whether personal data concerning them is being processed and access to that data.',
'Handle subject access requests.',
'SAR procedures, response records.',
ARRAY['SAR Procedures', 'SAR Response Records', 'Data Export Tools', 'Response Templates']),

('f0000006-0000-0000-0000-000000000001', 'd0006002-0000-0000-0000-000000000001', 'Art.16',
'Right to Rectification',
'Data subjects have the right to have inaccurate personal data rectified.',
'Handle rectification requests.',
'Rectification procedures, correction records.',
ARRAY['Rectification Procedures', 'Correction Request Records', 'Data Update Processes', 'Notification Procedures']),

('f0000006-0000-0000-0000-000000000001', 'd0006002-0000-0000-0000-000000000001', 'Art.17',
'Right to Erasure (Right to be Forgotten)',
'Data subjects have the right to have their personal data erased under certain conditions.',
'Handle erasure requests.',
'Erasure procedures, deletion records.',
ARRAY['Erasure Procedures', 'Deletion Request Records', 'Deletion Verification', 'Exception Handling']),

('f0000006-0000-0000-0000-000000000001', 'd0006002-0000-0000-0000-000000000001', 'Art.18',
'Right to Restriction of Processing',
'Data subjects have the right to obtain restriction of processing in certain circumstances.',
'Handle restriction requests.',
'Restriction procedures, processing limitations.',
ARRAY['Restriction Procedures', 'Restriction Request Records', 'Processing Limitation Mechanisms', 'Notification Processes']),

('f0000006-0000-0000-0000-000000000001', 'd0006002-0000-0000-0000-000000000001', 'Art.20',
'Right to Data Portability',
'Data subjects have the right to receive their personal data in a structured, commonly used, machine-readable format.',
'Provide data portability.',
'Portability procedures, data export capabilities.',
ARRAY['Portability Procedures', 'Data Export Formats', 'Transfer Mechanisms', 'Portability Request Records']),

('f0000006-0000-0000-0000-000000000001', 'd0006002-0000-0000-0000-000000000001', 'Art.21',
'Right to Object',
'Data subjects have the right to object to processing of their personal data.',
'Handle objection requests.',
'Objection procedures, opt-out mechanisms.',
ARRAY['Objection Procedures', 'Opt-out Mechanisms', 'Marketing Preferences', 'Objection Records']),

-- Controller Obligations
('f0000006-0000-0000-0000-000000000001', 'd0006003-0000-0000-0000-000000000001', 'Art.25',
'Data Protection by Design and Default',
'Implement appropriate technical and organisational measures to implement data protection principles.',
'Build privacy into systems by design.',
'Privacy by design documentation, default settings.',
ARRAY['Privacy by Design Framework', 'Default Settings Documentation', 'Design Assessments', 'Privacy Requirements']),

('f0000006-0000-0000-0000-000000000001', 'd0006003-0000-0000-0000-000000000001', 'Art.30',
'Records of Processing Activities',
'Maintain a record of processing activities under its responsibility.',
'Maintain processing records (ROPA).',
'Records of processing activities.',
ARRAY['Records of Processing Activities (ROPA)', 'Processing Inventory', 'Data Mapping', 'System Inventory']),

('f0000006-0000-0000-0000-000000000001', 'd0006003-0000-0000-0000-000000000001', 'Art.33',
'Notification of Personal Data Breach to Supervisory Authority',
'Notify the supervisory authority of a personal data breach within 72 hours.',
'Establish breach notification procedures.',
'Breach notification procedures, notification records.',
ARRAY['Breach Notification Procedures', 'Notification Templates', 'Breach Register', 'Notification Records']),

('f0000006-0000-0000-0000-000000000001', 'd0006003-0000-0000-0000-000000000001', 'Art.34',
'Communication of Personal Data Breach to Data Subject',
'Communicate the personal data breach to the data subject when required.',
'Notify data subjects of high-risk breaches.',
'Data subject notification procedures.',
ARRAY['Data Subject Notification Procedures', 'Communication Templates', 'Notification Records', 'Risk Assessment']),

('f0000006-0000-0000-0000-000000000001', 'd0006003-0000-0000-0000-000000000001', 'Art.35',
'Data Protection Impact Assessment',
'Carry out a DPIA where processing is likely to result in a high risk to the rights and freedoms of natural persons.',
'Conduct DPIAs for high-risk processing.',
'DPIA methodology, completed DPIAs.',
ARRAY['DPIA Methodology', 'Completed DPIAs', 'Risk Assessments', 'DPIA Threshold Analysis']),

('f0000006-0000-0000-0000-000000000001', 'd0006003-0000-0000-0000-000000000001', 'Art.37-39',
'Data Protection Officer',
'Designate a DPO in certain circumstances.',
'Appoint DPO where required.',
'DPO designation, DPO contact details, DPO responsibilities.',
ARRAY['DPO Designation', 'DPO Contact Details', 'DPO Responsibilities', 'DPO Independence Evidence']),

-- Security (Article 32)
('f0000006-0000-0000-0000-000000000001', 'd0006006-0000-0000-0000-000000000001', 'Art.32',
'Security of Processing',
'Implement appropriate technical and organisational measures to ensure a level of security appropriate to the risk.',
'Implement appropriate security measures.',
'Security measures, encryption, access controls, testing.',
ARRAY['Security Policy', 'Encryption Implementation', 'Access Control Measures', 'Security Testing Evidence']),

('f0000006-0000-0000-0000-000000000001', 'd0006006-0000-0000-0000-000000000001', 'Art.32.1.a',
'Pseudonymisation and Encryption',
'Implement pseudonymisation and encryption of personal data.',
'Apply pseudonymisation and encryption.',
'Pseudonymisation techniques, encryption configurations.',
ARRAY['Pseudonymisation Implementation', 'Encryption Standards', 'Key Management', 'Data Protection Techniques']),

('f0000006-0000-0000-0000-000000000001', 'd0006006-0000-0000-0000-000000000001', 'Art.32.1.b',
'Confidentiality, Integrity, Availability, Resilience',
'Ensure the ongoing confidentiality, integrity, availability and resilience of processing systems and services.',
'Maintain CIA and resilience.',
'Security controls for CIA, resilience measures.',
ARRAY['CIA Controls', 'Resilience Measures', 'Availability Documentation', 'Integrity Controls']),

('f0000006-0000-0000-0000-000000000001', 'd0006006-0000-0000-0000-000000000001', 'Art.32.1.c',
'Restore Availability and Access',
'Implement the ability to restore the availability and access to personal data in a timely manner in the event of a physical or technical incident.',
'Enable timely recovery.',
'Backup procedures, recovery testing.',
ARRAY['Backup Procedures', 'Recovery Plans', 'Recovery Testing Results', 'RTO/RPO Documentation']),

('f0000006-0000-0000-0000-000000000001', 'd0006006-0000-0000-0000-000000000001', 'Art.32.1.d',
'Testing and Evaluation',
'Implement a process for regularly testing, assessing and evaluating the effectiveness of technical and organisational measures.',
'Test security measures regularly.',
'Security testing, assessments, evaluations.',
ARRAY['Security Testing Schedule', 'Penetration Test Reports', 'Security Assessments', 'Effectiveness Reviews']),

-- Data Transfers (Chapter V)
('f0000006-0000-0000-0000-000000000001', 'd0006005-0000-0000-0000-000000000001', 'Art.44-49',
'International Data Transfers',
'Ensure appropriate safeguards for transfers of personal data to third countries.',
'Implement transfer safeguards.',
'Transfer impact assessments, SCCs, adequacy decisions.',
ARRAY['Transfer Impact Assessments', 'Standard Contractual Clauses', 'Adequacy Decision Reliance', 'Transfer Mechanisms Documentation'])

ON CONFLICT (framework_id, code) DO UPDATE SET
    description = EXCLUDED.description,
    guidance = EXCLUDED.guidance,
    evidence_requirements = EXCLUDED.evidence_requirements,
    evidence_examples = EXCLUDED.evidence_examples;
