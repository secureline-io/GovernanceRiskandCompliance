-- NIST Cybersecurity Framework 2.0 Seed Data

INSERT INTO frameworks (id, code, name, version, authority, category, description, official_url)
VALUES (
    'f0000003-0000-0000-0000-000000000001',
    'NIST-CSF',
    'NIST Cybersecurity Framework',
    '2.0',
    'NIST',
    'security',
    'The NIST Cybersecurity Framework provides a policy framework of computer security guidance for how private sector organizations can assess and improve their ability to prevent, detect, and respond to cyber attacks.',
    'https://www.nist.gov/cyberframework'
) ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description;

-- NIST CSF 2.0 Functions (6 core functions)
INSERT INTO framework_domains (id, framework_id, code, name, description, display_order)
VALUES
    ('d0003001-0000-0000-0000-000000000001', 'f0000003-0000-0000-0000-000000000001', 'GV', 'Govern', 'The organizations cybersecurity risk management strategy, expectations, and policy are established, communicated, and monitored', 1),
    ('d0003002-0000-0000-0000-000000000001', 'f0000003-0000-0000-0000-000000000001', 'ID', 'Identify', 'The organizations current cybersecurity risks are understood', 2),
    ('d0003003-0000-0000-0000-000000000001', 'f0000003-0000-0000-0000-000000000001', 'PR', 'Protect', 'Safeguards to manage the organizations cybersecurity risks are used', 3),
    ('d0003004-0000-0000-0000-000000000001', 'f0000003-0000-0000-0000-000000000001', 'DE', 'Detect', 'Possible cybersecurity attacks and compromises are found and analyzed', 4),
    ('d0003005-0000-0000-0000-000000000001', 'f0000003-0000-0000-0000-000000000001', 'RS', 'Respond', 'Actions regarding a detected cybersecurity incident are taken', 5),
    ('d0003006-0000-0000-0000-000000000001', 'f0000003-0000-0000-0000-000000000001', 'RC', 'Recover', 'Assets and operations affected by a cybersecurity incident are restored', 6)
ON CONFLICT DO NOTHING;

-- NIST CSF 2.0 Categories and Subcategories
INSERT INTO framework_requirements (framework_id, domain_id, code, name, description, guidance, evidence_requirements, evidence_examples)
VALUES

-- GOVERN Function
('f0000003-0000-0000-0000-000000000001', 'd0003001-0000-0000-0000-000000000001', 'GV.OC-01',
'Organizational Context',
'The organizational mission is understood and informs cybersecurity risk management.',
'Document how the organizations mission and objectives inform security priorities.',
'Mission statement, security alignment documentation.',
ARRAY['Mission statement', 'Security strategy alignment', 'Business context documentation', 'Stakeholder analysis']),

('f0000003-0000-0000-0000-000000000001', 'd0003001-0000-0000-0000-000000000001', 'GV.OC-02',
'Internal and External Stakeholders',
'Internal and external stakeholders are understood, and their needs and expectations regarding cybersecurity risk management are understood and considered.',
'Identify stakeholders and their security expectations.',
'Stakeholder inventory, requirement documentation.',
ARRAY['Stakeholder register', 'Requirements documentation', 'Stakeholder communication records', 'Expectation analysis']),

('f0000003-0000-0000-0000-000000000001', 'd0003001-0000-0000-0000-000000000001', 'GV.RM-01',
'Risk Management Strategy',
'Risk management objectives are established and agreed to by organizational stakeholders.',
'Establish risk management strategy and objectives.',
'Risk management policy, risk appetite statement, risk objectives.',
ARRAY['Risk Management Policy', 'Risk Appetite Statement', 'Risk objectives documentation', 'Board approval records']),

('f0000003-0000-0000-0000-000000000001', 'd0003001-0000-0000-0000-000000000001', 'GV.RM-02',
'Risk Appetite and Tolerance',
'Risk appetite and risk tolerance statements are established, communicated, and maintained.',
'Define and communicate risk appetite and tolerance.',
'Risk appetite statement, tolerance thresholds.',
ARRAY['Risk Appetite Statement', 'Risk tolerance levels', 'Communication records', 'Tolerance monitoring']),

('f0000003-0000-0000-0000-000000000001', 'd0003001-0000-0000-0000-000000000001', 'GV.PO-01',
'Cybersecurity Policy',
'Policy for managing cybersecurity risks is established based on organizational context, cybersecurity strategy, and priorities.',
'Develop comprehensive cybersecurity policies.',
'Cybersecurity policy, supporting policies, policy approval.',
ARRAY['Information Security Policy', 'Supporting policies', 'Policy approval records', 'Policy distribution evidence']),

('f0000003-0000-0000-0000-000000000001', 'd0003001-0000-0000-0000-000000000001', 'GV.RR-01',
'Roles and Responsibilities',
'Organizational leadership is responsible and accountable for cybersecurity risk.',
'Define leadership accountability for cybersecurity.',
'Roles documentation, accountability assignments, board oversight.',
ARRAY['CISO job description', 'Board security charter', 'Accountability matrix', 'Leadership security roles']),

('f0000003-0000-0000-0000-000000000001', 'd0003001-0000-0000-0000-000000000001', 'GV.SC-01',
'Supply Chain Risk Management',
'Cyber supply chain risk management processes are identified, established, managed, monitored, and improved by organizational stakeholders.',
'Implement supply chain risk management.',
'Supply chain policy, vendor assessment program.',
ARRAY['Supply Chain Security Policy', 'Vendor management procedures', 'Supplier assessments', 'Third-party risk inventory']),

-- IDENTIFY Function
('f0000003-0000-0000-0000-000000000001', 'd0003002-0000-0000-0000-000000000001', 'ID.AM-01',
'Asset Management - Hardware Inventory',
'Inventories of hardware managed by the organization are maintained.',
'Maintain comprehensive hardware inventory.',
'Hardware inventory, CMDB, asset tracking.',
ARRAY['Hardware inventory', 'CMDB reports', 'Asset tracking records', 'Network device inventory']),

('f0000003-0000-0000-0000-000000000001', 'd0003002-0000-0000-0000-000000000001', 'ID.AM-02',
'Asset Management - Software Inventory',
'Inventories of software, services, and systems managed by the organization are maintained.',
'Maintain software and system inventory.',
'Software inventory, license tracking, application catalog.',
ARRAY['Software inventory', 'License management records', 'Application catalog', 'SaaS inventory']),

('f0000003-0000-0000-0000-000000000001', 'd0003002-0000-0000-0000-000000000001', 'ID.AM-03',
'Asset Management - Data Inventory',
'Representations of the organizations authorized network communication and internal and external network data flows are maintained.',
'Document data flows and network communications.',
'Data flow diagrams, network topology, data inventory.',
ARRAY['Data flow diagrams', 'Network topology', 'Data inventory', 'Data classification records']),

('f0000003-0000-0000-0000-000000000001', 'd0003002-0000-0000-0000-000000000001', 'ID.RA-01',
'Risk Assessment - Vulnerabilities',
'Vulnerabilities in assets are identified, validated, and recorded.',
'Identify and track vulnerabilities.',
'Vulnerability scans, vulnerability register, remediation tracking.',
ARRAY['Vulnerability scan reports', 'Vulnerability register', 'Remediation tracking', 'CVE monitoring']),

('f0000003-0000-0000-0000-000000000001', 'd0003002-0000-0000-0000-000000000001', 'ID.RA-02',
'Risk Assessment - Threat Intelligence',
'Cyber threat intelligence is received from information sharing forums and sources.',
'Collect and analyze threat intelligence.',
'Threat intelligence feeds, threat analysis reports.',
ARRAY['Threat intelligence subscriptions', 'Threat analysis reports', 'IOC feeds', 'ISAC participation']),

('f0000003-0000-0000-0000-000000000001', 'd0003002-0000-0000-0000-000000000001', 'ID.RA-03',
'Risk Assessment - Threats',
'Internal and external threats to the organization are identified and recorded.',
'Identify and document threats.',
'Threat register, threat assessments.',
ARRAY['Threat register', 'Threat assessments', 'Threat modeling outputs', 'Attack surface analysis']),

('f0000003-0000-0000-0000-000000000001', 'd0003002-0000-0000-0000-000000000001', 'ID.RA-04',
'Risk Assessment - Impacts',
'Potential impacts and likelihoods of threats exploiting vulnerabilities are identified and recorded.',
'Assess threat impacts and likelihoods.',
'Impact assessments, likelihood determinations, risk calculations.',
ARRAY['Impact assessments', 'Risk calculations', 'BIA documentation', 'Risk scoring methodology']),

('f0000003-0000-0000-0000-000000000001', 'd0003002-0000-0000-0000-000000000001', 'ID.IM-01',
'Improvement - Lessons Learned',
'Improvements are identified from security tests and exercises, including those done in coordination with suppliers and relevant third parties.',
'Capture and implement lessons learned.',
'Lessons learned reports, improvement tracking.',
ARRAY['Lessons learned reports', 'Improvement action items', 'Post-incident reviews', 'Exercise after-action reports']),

-- PROTECT Function
('f0000003-0000-0000-0000-000000000001', 'd0003003-0000-0000-0000-000000000001', 'PR.AA-01',
'Identity Management',
'Identities and credentials for authorized users, services, and hardware are managed by the organization.',
'Manage identities and credentials.',
'Identity management procedures, credential management.',
ARRAY['Identity management policy', 'Credential management procedures', 'IdP configurations', 'Identity lifecycle records']),

('f0000003-0000-0000-0000-000000000001', 'd0003003-0000-0000-0000-000000000001', 'PR.AA-02',
'Authentication',
'Identities are proofed and bound to credentials based on the context of interactions.',
'Implement strong authentication.',
'Authentication policies, MFA configurations.',
ARRAY['Authentication policy', 'MFA configurations', 'Identity proofing procedures', 'Authentication logs']),

('f0000003-0000-0000-0000-000000000001', 'd0003003-0000-0000-0000-000000000001', 'PR.AA-03',
'Access Control',
'Access permissions, entitlements, and authorizations are defined and managed based on the principle of least privilege and separation of duties.',
'Implement least privilege access.',
'Access control policies, RBAC configurations, SoD matrix.',
ARRAY['Access control policy', 'RBAC configurations', 'Least privilege evidence', 'SoD matrix']),

('f0000003-0000-0000-0000-000000000001', 'd0003003-0000-0000-0000-000000000001', 'PR.AT-01',
'Awareness and Training',
'Personnel are provided cybersecurity awareness and training.',
'Provide security awareness training.',
'Training program, completion records.',
ARRAY['Security awareness program', 'Training materials', 'Completion records', 'Phishing simulation results']),

('f0000003-0000-0000-0000-000000000001', 'd0003003-0000-0000-0000-000000000001', 'PR.DS-01',
'Data Security - Data at Rest',
'The confidentiality, integrity, and availability of data-at-rest are protected.',
'Protect data at rest.',
'Encryption configurations, data protection controls.',
ARRAY['Encryption at rest configurations', 'Database encryption evidence', 'File system encryption', 'Data classification controls']),

('f0000003-0000-0000-0000-000000000001', 'd0003003-0000-0000-0000-000000000001', 'PR.DS-02',
'Data Security - Data in Transit',
'The confidentiality, integrity, and availability of data-in-transit are protected.',
'Protect data in transit.',
'TLS configurations, encryption in transit.',
ARRAY['TLS configurations', 'Certificate inventory', 'Secure protocol enforcement', 'Network encryption evidence']),

('f0000003-0000-0000-0000-000000000001', 'd0003003-0000-0000-0000-000000000001', 'PR.PS-01',
'Platform Security - Configuration Management',
'Configuration management practices are established and applied.',
'Implement configuration management.',
'Configuration baselines, hardening guides.',
ARRAY['Configuration baselines', 'Hardening guides', 'Configuration compliance scans', 'Change management records']),

('f0000003-0000-0000-0000-000000000001', 'd0003003-0000-0000-0000-000000000001', 'PR.IR-01',
'Technology Infrastructure Resilience',
'Networks and environments are protected from unauthorized logical access and usage.',
'Implement network protection.',
'Firewall rules, network segmentation, access controls.',
ARRAY['Firewall configurations', 'Network segmentation', 'Network access controls', 'DMZ documentation']),

-- DETECT Function
('f0000003-0000-0000-0000-000000000001', 'd0003004-0000-0000-0000-000000000001', 'DE.CM-01',
'Continuous Monitoring - Networks',
'Networks are monitored to find potentially adverse events.',
'Monitor networks for threats.',
'Network monitoring configurations, alerting rules.',
ARRAY['Network monitoring dashboards', 'IDS/IPS configurations', 'Network alert rules', 'Traffic analysis tools']),

('f0000003-0000-0000-0000-000000000001', 'd0003004-0000-0000-0000-000000000001', 'DE.CM-02',
'Continuous Monitoring - Physical Environment',
'The physical environment is monitored to find potentially adverse events.',
'Monitor physical environment.',
'Physical monitoring systems, environmental alerts.',
ARRAY['Physical security monitoring', 'Environmental monitoring', 'CCTV systems', 'Access badge logs']),

('f0000003-0000-0000-0000-000000000001', 'd0003004-0000-0000-0000-000000000001', 'DE.CM-03',
'Continuous Monitoring - Personnel Activity',
'Personnel activity and technology usage are monitored to find potentially adverse events.',
'Monitor user activity.',
'User activity monitoring, behavior analytics.',
ARRAY['User activity monitoring', 'UEBA configurations', 'Privileged user monitoring', 'Activity logging']),

('f0000003-0000-0000-0000-000000000001', 'd0003004-0000-0000-0000-000000000001', 'DE.AE-01',
'Adverse Event Analysis',
'Anomalies, indicators of compromise, and other potentially adverse events are analyzed to characterize the events and detect cybersecurity incidents.',
'Analyze security events.',
'Event analysis procedures, incident detection.',
ARRAY['Event analysis procedures', 'IOC analysis', 'Correlation rules', 'Detection playbooks']),

-- RESPOND Function
('f0000003-0000-0000-0000-000000000001', 'd0003005-0000-0000-0000-000000000001', 'RS.MA-01',
'Incident Management',
'The incident response plan is executed in coordination with relevant third parties once an incident is declared.',
'Execute incident response.',
'Incident response plan, incident records.',
ARRAY['Incident Response Plan', 'Incident tickets', 'Third-party coordination records', 'Communication logs']),

('f0000003-0000-0000-0000-000000000001', 'd0003005-0000-0000-0000-000000000001', 'RS.AN-01',
'Incident Analysis',
'Investigation is conducted to ensure adequate response and support forensics and recovery activities.',
'Conduct incident investigation.',
'Investigation procedures, forensic analysis.',
ARRAY['Investigation procedures', 'Forensic analysis reports', 'Evidence collection records', 'Root cause analysis']),

('f0000003-0000-0000-0000-000000000001', 'd0003005-0000-0000-0000-000000000001', 'RS.CO-01',
'Incident Reporting',
'Internal and external stakeholders are notified of incidents.',
'Report incidents to stakeholders.',
'Notification procedures, communication records.',
ARRAY['Notification procedures', 'Stakeholder communications', 'Regulatory notifications', 'Status reports']),

('f0000003-0000-0000-0000-000000000001', 'd0003005-0000-0000-0000-000000000001', 'RS.MI-01',
'Incident Mitigation',
'Incidents are contained and their impact is mitigated.',
'Contain and mitigate incidents.',
'Containment procedures, mitigation actions.',
ARRAY['Containment procedures', 'Mitigation actions', 'Eradication evidence', 'Impact reduction measures']),

-- RECOVER Function
('f0000003-0000-0000-0000-000000000001', 'd0003006-0000-0000-0000-000000000001', 'RC.RP-01',
'Recovery Planning',
'The recovery plan is executed during or after a cybersecurity incident.',
'Execute recovery plans.',
'Recovery procedures, restoration evidence.',
ARRAY['Recovery plans', 'Restoration procedures', 'Recovery testing', 'Prioritization documentation']),

('f0000003-0000-0000-0000-000000000001', 'd0003006-0000-0000-0000-000000000001', 'RC.CO-01',
'Recovery Communications',
'Recovery activities and progress are communicated to designated internal and external stakeholders.',
'Communicate recovery progress.',
'Communication plans, status updates.',
ARRAY['Communication plan', 'Status update records', 'Stakeholder briefings', 'Public communications']),

('f0000003-0000-0000-0000-000000000001', 'd0003006-0000-0000-0000-000000000001', 'RC.CO-02',
'Public Relations',
'Public relations are managed.',
'Manage public communications.',
'PR procedures, media communications.',
ARRAY['PR procedures', 'Media statements', 'Social media monitoring', 'Reputation management'])

ON CONFLICT (framework_id, code) DO UPDATE SET
    description = EXCLUDED.description,
    guidance = EXCLUDED.guidance,
    evidence_requirements = EXCLUDED.evidence_requirements,
    evidence_examples = EXCLUDED.evidence_examples;
