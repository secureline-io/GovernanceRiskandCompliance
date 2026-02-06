-- GRC Platform - Comprehensive Compliance Frameworks Seed Data
-- All major global cybersecurity frameworks with controls and evidence requirements

-- ============================================
-- SOC 2 TYPE II (AICPA Trust Services Criteria)
-- ============================================

INSERT INTO frameworks (id, code, name, version, authority, category, description, official_url)
VALUES (
    'f0000001-0000-0000-0000-000000000001',
    'SOC2',
    'SOC 2 Type II',
    '2017',
    'AICPA',
    'security',
    'Service Organization Control 2 Type II report based on AICPA Trust Services Criteria. Evaluates the design and operating effectiveness of controls relevant to security, availability, processing integrity, confidentiality, and privacy.',
    'https://www.aicpa.org/interestareas/frc/assuranceadvisoryservices/sorhome'
) ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description;

-- SOC 2 Domains (Trust Services Categories)
INSERT INTO framework_domains (id, framework_id, code, name, description, display_order)
VALUES
    ('d0001001-0000-0000-0000-000000000001', 'f0000001-0000-0000-0000-000000000001', 'CC', 'Common Criteria (Security)', 'Controls relevant to all trust services categories', 1),
    ('d0001002-0000-0000-0000-000000000001', 'f0000001-0000-0000-0000-000000000001', 'A', 'Availability', 'Controls related to system availability and performance', 2),
    ('d0001003-0000-0000-0000-000000000001', 'f0000001-0000-0000-0000-000000000001', 'PI', 'Processing Integrity', 'Controls related to completeness, accuracy, and authorization of processing', 3),
    ('d0001004-0000-0000-0000-000000000001', 'f0000001-0000-0000-0000-000000000001', 'C', 'Confidentiality', 'Controls related to protection of confidential information', 4),
    ('d0001005-0000-0000-0000-000000000001', 'f0000001-0000-0000-0000-000000000001', 'P', 'Privacy', 'Controls related to privacy of personal information', 5)
ON CONFLICT DO NOTHING;

-- SOC 2 Common Criteria Controls
INSERT INTO framework_requirements (framework_id, domain_id, code, name, description, guidance, evidence_requirements, evidence_examples)
VALUES
-- CC1: Control Environment
('f0000001-0000-0000-0000-000000000001', 'd0001001-0000-0000-0000-000000000001', 'CC1.1',
'COSO Principle 1: Demonstrates Commitment to Integrity and Ethical Values',
'The entity demonstrates a commitment to integrity and ethical values.',
'Management should establish and communicate standards of conduct, evaluate adherence, and address deviations in a timely manner.',
'Evidence of code of conduct, ethics policies, annual acknowledgments, and disciplinary actions for violations.',
ARRAY['Code of Conduct document', 'Ethics Policy', 'Employee acknowledgment records', 'Background check policy', 'Disciplinary action records']),

('f0000001-0000-0000-0000-000000000001', 'd0001001-0000-0000-0000-000000000001', 'CC1.2',
'COSO Principle 2: Exercises Oversight Responsibility',
'The board of directors demonstrates independence from management and exercises oversight of the development and performance of internal control.',
'Board should have oversight of security program, receive regular reports, and maintain independence.',
'Board meeting minutes, security reports to board, board charter, independence attestations.',
ARRAY['Board meeting minutes', 'Board charter', 'Security committee reports', 'Independence certifications', 'Governance structure documentation']),

('f0000001-0000-0000-0000-000000000001', 'd0001001-0000-0000-0000-000000000001', 'CC1.3',
'COSO Principle 3: Establishes Structure, Authority, and Responsibility',
'Management establishes, with board oversight, structures, reporting lines, and appropriate authorities and responsibilities.',
'Define organizational structure, roles, responsibilities for security program.',
'Organization charts, job descriptions, RACI matrices, security team structure.',
ARRAY['Organization chart', 'Job descriptions', 'RACI matrix', 'Security team charter', 'Roles and responsibilities documentation']),

('f0000001-0000-0000-0000-000000000001', 'd0001001-0000-0000-0000-000000000001', 'CC1.4',
'COSO Principle 4: Demonstrates Commitment to Competence',
'The entity demonstrates a commitment to attract, develop, and retain competent individuals.',
'Establish competency requirements, training programs, and performance evaluations.',
'Training records, competency assessments, hiring criteria, performance reviews.',
ARRAY['Training policy', 'Training completion records', 'Competency matrix', 'Hiring procedures', 'Performance review records']),

('f0000001-0000-0000-0000-000000000001', 'd0001001-0000-0000-0000-000000000001', 'CC1.5',
'COSO Principle 5: Enforces Accountability',
'The entity holds individuals accountable for their internal control responsibilities.',
'Define performance measures, incentives, and consequences related to security responsibilities.',
'Performance metrics, accountability documentation, disciplinary procedures.',
ARRAY['Performance metrics', 'Accountability assignments', 'Disciplinary policy', 'KPIs documentation', 'Responsibility acknowledgments']),

-- CC2: Communication and Information
('f0000001-0000-0000-0000-000000000001', 'd0001001-0000-0000-0000-000000000001', 'CC2.1',
'COSO Principle 13: Uses Relevant Information',
'The entity obtains or generates and uses relevant, quality information to support the functioning of internal control.',
'Identify information requirements and sources for security program operation.',
'Information flow diagrams, data quality procedures, reporting mechanisms.',
ARRAY['Information flow documentation', 'Data quality procedures', 'Security metrics reports', 'Dashboard screenshots', 'Monitoring reports']),

('f0000001-0000-0000-0000-000000000001', 'd0001001-0000-0000-0000-000000000001', 'CC2.2',
'COSO Principle 14: Communicates Internally',
'The entity internally communicates information, including objectives and responsibilities for internal control.',
'Establish communication channels for security matters across the organization.',
'Internal communication records, security awareness materials, policy distribution evidence.',
ARRAY['Security newsletters', 'All-hands meeting records', 'Intranet security pages', 'Policy distribution logs', 'Security awareness materials']),

('f0000001-0000-0000-0000-000000000001', 'd0001001-0000-0000-0000-000000000001', 'CC2.3',
'COSO Principle 15: Communicates Externally',
'The entity communicates with external parties regarding matters affecting the functioning of internal control.',
'Communicate security commitments, requirements to external parties.',
'External communications, customer security documentation, vendor communications.',
ARRAY['Customer security communications', 'Public security documentation', 'Trust center/security page', 'Vendor security requirements', 'External reporting procedures']),

-- CC3: Risk Assessment
('f0000001-0000-0000-0000-000000000001', 'd0001001-0000-0000-0000-000000000001', 'CC3.1',
'COSO Principle 6: Specifies Suitable Objectives',
'The entity specifies objectives with sufficient clarity to enable the identification and assessment of risks.',
'Define security objectives aligned with business requirements.',
'Security objectives documentation, strategic security plans, risk appetite statements.',
ARRAY['Security objectives document', 'Security strategy', 'Risk appetite statement', 'Service level objectives', 'Security program charter']),

('f0000001-0000-0000-0000-000000000001', 'd0001001-0000-0000-0000-000000000001', 'CC3.2',
'COSO Principle 7: Identifies and Analyzes Risk',
'The entity identifies risks to the achievement of its objectives and analyzes risks as a basis for determining how the risks should be managed.',
'Conduct regular risk assessments, maintain risk register, analyze threats.',
'Risk assessment reports, risk register, threat analysis documentation.',
ARRAY['Risk assessment report', 'Risk register', 'Threat assessment', 'Vulnerability scan reports', 'Penetration test results']),

('f0000001-0000-0000-0000-000000000001', 'd0001001-0000-0000-0000-000000000001', 'CC3.3',
'COSO Principle 8: Assesses Fraud Risk',
'The entity considers the potential for fraud in assessing risks to the achievement of objectives.',
'Assess fraud risks including unauthorized access, data manipulation.',
'Fraud risk assessment, anti-fraud controls documentation.',
ARRAY['Fraud risk assessment', 'Anti-fraud policy', 'Segregation of duties matrix', 'Fraud detection controls', 'Whistleblower policy']),

('f0000001-0000-0000-0000-000000000001', 'd0001001-0000-0000-0000-000000000001', 'CC3.4',
'COSO Principle 9: Identifies and Analyzes Significant Change',
'The entity identifies and assesses changes that could significantly impact the system of internal control.',
'Monitor for changes that could affect security posture, assess impacts.',
'Change management procedures, impact assessments, change logs.',
ARRAY['Change management policy', 'Change advisory board records', 'Impact assessments', 'Change logs', 'Security review of changes']),

-- CC4: Monitoring Activities
('f0000001-0000-0000-0000-000000000001', 'd0001001-0000-0000-0000-000000000001', 'CC4.1',
'COSO Principle 16: Selects, Develops, and Performs Ongoing Evaluations',
'The entity selects, develops, and performs ongoing and/or separate evaluations.',
'Implement continuous monitoring, periodic assessments of control effectiveness.',
'Monitoring procedures, evaluation reports, continuous monitoring evidence.',
ARRAY['Continuous monitoring dashboards', 'Control testing results', 'Internal audit reports', 'Assessment schedules', 'Evaluation procedures']),

('f0000001-0000-0000-0000-000000000001', 'd0001001-0000-0000-0000-000000000001', 'CC4.2',
'COSO Principle 17: Evaluates and Communicates Deficiencies',
'The entity evaluates and communicates internal control deficiencies in a timely manner.',
'Track and remediate identified control deficiencies.',
'Deficiency tracking, remediation plans, management reporting.',
ARRAY['Issue tracking system records', 'Remediation plans', 'Management reports on deficiencies', 'Control gap analysis', 'Corrective action evidence']),

-- CC5: Control Activities
('f0000001-0000-0000-0000-000000000001', 'd0001001-0000-0000-0000-000000000001', 'CC5.1',
'COSO Principle 10: Selects and Develops Control Activities',
'The entity selects and develops control activities that contribute to the mitigation of risks.',
'Design and implement controls to address identified risks.',
'Control design documentation, risk-control mapping.',
ARRAY['Control catalog', 'Risk-control matrix', 'Control design documents', 'Control implementation evidence', 'Control objectives documentation']),

('f0000001-0000-0000-0000-000000000001', 'd0001001-0000-0000-0000-000000000001', 'CC5.2',
'COSO Principle 11: Selects and Develops General Controls over Technology',
'The entity selects and develops general control activities over technology to support the achievement of objectives.',
'Implement IT general controls including access, change management, operations.',
'IT control documentation, system configurations, technology policies.',
ARRAY['IT general controls documentation', 'System configuration standards', 'Technology policies', 'Access control configurations', 'IT operations procedures']),

('f0000001-0000-0000-0000-000000000001', 'd0001001-0000-0000-0000-000000000001', 'CC5.3',
'COSO Principle 12: Deploys Through Policies and Procedures',
'The entity deploys control activities through policies and procedures.',
'Document and communicate policies and procedures for all control activities.',
'Policies, procedures, policy acknowledgments.',
ARRAY['Security policies', 'Operating procedures', 'Policy acknowledgments', 'Procedure documentation', 'Policy review records']),

-- CC6: Logical and Physical Access Controls
('f0000001-0000-0000-0000-000000000001', 'd0001001-0000-0000-0000-000000000001', 'CC6.1',
'Logical Access Security Software, Infrastructure, and Architectures',
'The entity implements logical access security software, infrastructure, and architectures to protect information assets.',
'Implement network segmentation, firewalls, access control systems.',
'Network diagrams, firewall configurations, access control system documentation.',
ARRAY['Network architecture diagram', 'Firewall rules', 'Access control system configurations', 'Security architecture documentation', 'Infrastructure security standards']),

('f0000001-0000-0000-0000-000000000001', 'd0001001-0000-0000-0000-000000000001', 'CC6.2',
'Prior to Issuing System Credentials and Granting System Access',
'Prior to issuing system credentials and granting system access, the entity registers and authorizes new internal and external users.',
'Implement user provisioning process with proper authorization.',
'Access request forms, approval workflows, provisioning procedures.',
ARRAY['Access request forms', 'Approval workflow evidence', 'User provisioning procedure', 'Authorization records', 'New user setup checklist']),

('f0000001-0000-0000-0000-000000000001', 'd0001001-0000-0000-0000-000000000001', 'CC6.3',
'Removes Access to Protected Information Assets',
'The entity removes access to protected information assets when appropriate.',
'Implement offboarding process, access review, termination procedures.',
'Termination checklists, access removal evidence, offboarding procedures.',
ARRAY['Termination checklist', 'Access removal logs', 'Offboarding procedure', 'User deprovisioning records', 'HR notification process']),

('f0000001-0000-0000-0000-000000000001', 'd0001001-0000-0000-0000-000000000001', 'CC6.4',
'Restricts Physical Access',
'The entity restricts physical access to facilities and protected information assets.',
'Implement physical security controls including badge access, visitor management.',
'Physical security policies, access logs, visitor logs.',
ARRAY['Physical security policy', 'Badge access logs', 'Visitor logs', 'Data center access records', 'Physical security assessments']),

('f0000001-0000-0000-0000-000000000001', 'd0001001-0000-0000-0000-000000000001', 'CC6.5',
'Disposes of Protected Information Assets',
'The entity disposes of protected information assets in a secure manner.',
'Implement secure data destruction and media sanitization procedures.',
'Data destruction certificates, media sanitization logs.',
ARRAY['Data destruction policy', 'Destruction certificates', 'Media sanitization records', 'Asset disposal logs', 'Secure disposal procedures']),

('f0000001-0000-0000-0000-000000000001', 'd0001001-0000-0000-0000-000000000001', 'CC6.6',
'Protects Against External and Internal Threats',
'The entity implements controls to protect against external and internal security threats.',
'Deploy security technologies including antivirus, IDS/IPS, endpoint protection.',
'Security tool configurations, threat detection evidence.',
ARRAY['Antivirus/EDR configurations', 'IDS/IPS alerts', 'Security monitoring dashboards', 'Threat detection logs', 'Security tool inventory']),

('f0000001-0000-0000-0000-000000000001', 'd0001001-0000-0000-0000-000000000001', 'CC6.7',
'Restricts Transmission, Movement, and Removal',
'The entity restricts the transmission, movement, and removal of information to authorized users and processes.',
'Implement DLP, encryption, secure transmission controls.',
'DLP configurations, encryption standards, data transfer logs.',
ARRAY['DLP policy and configurations', 'Encryption standards', 'Data transfer procedures', 'Secure file transfer logs', 'Data classification policy']),

('f0000001-0000-0000-0000-000000000001', 'd0001001-0000-0000-0000-000000000001', 'CC6.8',
'Controls Against Malicious Software',
'The entity implements controls to prevent or detect and act upon the introduction of unauthorized or malicious software.',
'Deploy endpoint protection, application whitelisting, malware detection.',
'Endpoint security configurations, malware scan reports.',
ARRAY['Endpoint protection configurations', 'Malware scan reports', 'Application control policies', 'Security software update logs', 'Malware incident records']),

-- CC7: System Operations
('f0000001-0000-0000-0000-000000000001', 'd0001001-0000-0000-0000-000000000001', 'CC7.1',
'Detects and Monitors Security Events',
'The entity uses detection and monitoring procedures to identify security events.',
'Implement SIEM, logging, monitoring, alerting capabilities.',
'SIEM configurations, monitoring procedures, alert evidence.',
ARRAY['SIEM configuration', 'Monitoring procedures', 'Alert configurations', 'Security event logs', 'Monitoring dashboards']),

('f0000001-0000-0000-0000-000000000001', 'd0001001-0000-0000-0000-000000000001', 'CC7.2',
'Monitors System Components for Anomalies',
'The entity monitors system components and the operation of those components for anomalies.',
'Monitor for anomalous behavior, establish baselines, detect deviations.',
'Baseline documentation, anomaly detection configurations, alert samples.',
ARRAY['Baseline configurations', 'Anomaly detection rules', 'Performance monitoring dashboards', 'Threshold alerting evidence', 'System health reports']),

('f0000001-0000-0000-0000-000000000001', 'd0001001-0000-0000-0000-000000000001', 'CC7.3',
'Evaluates Security Events',
'The entity evaluates security events to determine whether they could or have resulted in a failure.',
'Implement security event analysis, incident triage procedures.',
'Event analysis procedures, incident triage documentation.',
ARRAY['Event analysis procedures', 'Incident triage process', 'Security event classifications', 'Analysis workpapers', 'Event investigation records']),

('f0000001-0000-0000-0000-000000000001', 'd0001001-0000-0000-0000-000000000001', 'CC7.4',
'Responds to Security Incidents',
'The entity responds to identified security incidents.',
'Implement incident response plan, IR team, communication procedures.',
'Incident response plan, IR team roster, incident tickets.',
ARRAY['Incident response plan', 'IR team contact list', 'Incident tickets/records', 'Post-incident reports', 'Communication templates']),

('f0000001-0000-0000-0000-000000000001', 'd0001001-0000-0000-0000-000000000001', 'CC7.5',
'Recovers from Security Incidents',
'The entity identifies, develops, and implements activities to recover from identified security incidents.',
'Implement recovery procedures, lessons learned process.',
'Recovery procedures, post-incident reviews, lessons learned.',
ARRAY['Recovery procedures', 'Post-incident review reports', 'Lessons learned documentation', 'Recovery testing evidence', 'Improvement action items']),

-- CC8: Change Management
('f0000001-0000-0000-0000-000000000001', 'd0001001-0000-0000-0000-000000000001', 'CC8.1',
'Infrastructure and Software Change Management',
'The entity authorizes, designs, develops or acquires, configures, documents, tests, approves, and implements changes to infrastructure and software.',
'Implement change management process with testing, approval, documentation.',
'Change management policy, change tickets, approval evidence.',
ARRAY['Change management policy', 'Change tickets with approvals', 'Test evidence', 'CAB meeting minutes', 'Deployment records']),

-- CC9: Risk Mitigation
('f0000001-0000-0000-0000-000000000001', 'd0001001-0000-0000-0000-000000000001', 'CC9.1',
'Business Continuity and Disaster Recovery',
'The entity identifies, selects, and develops risk mitigation activities for risks arising from potential business disruptions.',
'Implement BCP/DR plans, conduct testing, maintain recovery capabilities.',
'BCP/DR plans, test results, recovery time objectives.',
ARRAY['Business continuity plan', 'Disaster recovery plan', 'BCP/DR test results', 'RTO/RPO documentation', 'Recovery capability evidence']),

('f0000001-0000-0000-0000-000000000001', 'd0001001-0000-0000-0000-000000000001', 'CC9.2',
'Vendor and Third-Party Risk Management',
'The entity assesses and manages risks associated with vendors and business partners.',
'Implement vendor risk management program, conduct assessments.',
'Vendor risk assessment procedures, assessment results, vendor inventory.',
ARRAY['Vendor management policy', 'Vendor risk assessments', 'Vendor inventory', 'Due diligence records', 'Vendor security requirements'])

ON CONFLICT (framework_id, code) DO UPDATE SET
    description = EXCLUDED.description,
    guidance = EXCLUDED.guidance,
    evidence_requirements = EXCLUDED.evidence_requirements,
    evidence_examples = EXCLUDED.evidence_examples;
