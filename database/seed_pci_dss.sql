-- PCI DSS 4.0 Seed Data

INSERT INTO frameworks (id, code, name, version, authority, category, description, official_url)
VALUES (
    'f0000004-0000-0000-0000-000000000001',
    'PCI-DSS',
    'PCI DSS',
    '4.0',
    'PCI Security Standards Council',
    'industry',
    'The Payment Card Industry Data Security Standard (PCI DSS) is a set of security standards designed to ensure that all companies that accept, process, store or transmit credit card information maintain a secure environment.',
    'https://www.pcisecuritystandards.org/document_library/'
) ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description;

-- PCI DSS 4.0 Requirements (12 main requirements)
INSERT INTO framework_domains (id, framework_id, code, name, description, display_order)
VALUES
    ('d0004001-0000-0000-0000-000000000001', 'f0000004-0000-0000-0000-000000000001', 'R1', 'Install and Maintain Network Security Controls', 'Build and maintain a secure network and systems', 1),
    ('d0004002-0000-0000-0000-000000000001', 'f0000004-0000-0000-0000-000000000001', 'R2', 'Apply Secure Configurations', 'Do not use vendor-supplied defaults', 2),
    ('d0004003-0000-0000-0000-000000000001', 'f0000004-0000-0000-0000-000000000001', 'R3', 'Protect Stored Account Data', 'Protect stored cardholder data', 3),
    ('d0004004-0000-0000-0000-000000000001', 'f0000004-0000-0000-0000-000000000001', 'R4', 'Protect Cardholder Data with Strong Cryptography', 'Encrypt transmission of cardholder data', 4),
    ('d0004005-0000-0000-0000-000000000001', 'f0000004-0000-0000-0000-000000000001', 'R5', 'Protect All Systems Against Malware', 'Use and regularly update anti-virus software', 5),
    ('d0004006-0000-0000-0000-000000000001', 'f0000004-0000-0000-0000-000000000001', 'R6', 'Develop and Maintain Secure Systems', 'Develop and maintain secure systems and applications', 6),
    ('d0004007-0000-0000-0000-000000000001', 'f0000004-0000-0000-0000-000000000001', 'R7', 'Restrict Access to System Components', 'Restrict access to cardholder data by business need-to-know', 7),
    ('d0004008-0000-0000-0000-000000000001', 'f0000004-0000-0000-0000-000000000001', 'R8', 'Identify Users and Authenticate Access', 'Assign a unique ID to each person with computer access', 8),
    ('d0004009-0000-0000-0000-000000000001', 'f0000004-0000-0000-0000-000000000001', 'R9', 'Restrict Physical Access', 'Restrict physical access to cardholder data', 9),
    ('d0004010-0000-0000-0000-000000000001', 'f0000004-0000-0000-0000-000000000001', 'R10', 'Log and Monitor All Access', 'Track and monitor all access to network resources and cardholder data', 10),
    ('d0004011-0000-0000-0000-000000000001', 'f0000004-0000-0000-0000-000000000001', 'R11', 'Test Security Systems and Networks', 'Regularly test security systems and processes', 11),
    ('d0004012-0000-0000-0000-000000000001', 'f0000004-0000-0000-0000-000000000001', 'R12', 'Support Information Security', 'Maintain a policy that addresses information security', 12)
ON CONFLICT DO NOTHING;

-- PCI DSS 4.0 Detailed Requirements
INSERT INTO framework_requirements (framework_id, domain_id, code, name, description, guidance, evidence_requirements, evidence_examples)
VALUES

-- Requirement 1: Network Security Controls
('f0000004-0000-0000-0000-000000000001', 'd0004001-0000-0000-0000-000000000001', '1.1.1',
'Network Security Policies and Procedures',
'All security policies and operational procedures identified in Requirement 1 are documented, kept up to date, in use, and known to all affected parties.',
'Document firewall and network security policies and procedures.',
'Network security policy, firewall management procedures, change management.',
ARRAY['Network Security Policy', 'Firewall management procedures', 'Network change procedures', 'Policy acknowledgments']),

('f0000004-0000-0000-0000-000000000001', 'd0004001-0000-0000-0000-000000000001', '1.2.1',
'Network Diagram',
'Configuration standards for NSCs are defined, implemented, and maintained.',
'Document network architecture and cardholder data flows.',
'Network diagrams, data flow diagrams, CDE documentation.',
ARRAY['Network architecture diagram', 'Cardholder data flow diagram', 'CDE boundary documentation', 'Network device inventory']),

('f0000004-0000-0000-0000-000000000001', 'd0004001-0000-0000-0000-000000000001', '1.2.5',
'Firewall and Router Configuration',
'All services, protocols, and ports allowed are identified, approved, and have a defined business need.',
'Document approved services and ports.',
'Firewall rule documentation, service justifications.',
ARRAY['Firewall rules with justifications', 'Port/service inventory', 'Approval records', 'Rule review evidence']),

('f0000004-0000-0000-0000-000000000001', 'd0004001-0000-0000-0000-000000000001', '1.3.1',
'Inbound Traffic Restriction',
'Inbound traffic to the CDE is restricted to only necessary traffic.',
'Configure firewalls to restrict inbound traffic.',
'Firewall configurations, traffic analysis.',
ARRAY['Inbound firewall rules', 'Traffic analysis reports', 'Rule justifications', 'Deny-all configurations']),

('f0000004-0000-0000-0000-000000000001', 'd0004001-0000-0000-0000-000000000001', '1.4.1',
'NSC Between Wireless and CDE',
'NSCs are implemented between wireless networks and the CDE.',
'Segment wireless networks from CDE.',
'Wireless segmentation, firewall rules.',
ARRAY['Wireless network segmentation', 'Wireless to CDE firewall rules', 'Network isolation evidence', 'VLAN configurations']),

-- Requirement 2: Secure Configurations
('f0000004-0000-0000-0000-000000000001', 'd0004002-0000-0000-0000-000000000001', '2.1.1',
'Change Default Credentials',
'All vendor-supplied default accounts and passwords are changed before installing a system on the network.',
'Change all default credentials.',
'Default credential change evidence, credential management.',
ARRAY['Default credential change records', 'Password change evidence', 'Credential management procedures', 'System hardening checklists']),

('f0000004-0000-0000-0000-000000000001', 'd0004002-0000-0000-0000-000000000001', '2.2.1',
'Configuration Standards',
'Configuration standards are developed, implemented, and maintained for all system components.',
'Develop and apply configuration standards.',
'Configuration standards, hardening guides, baseline configurations.',
ARRAY['System hardening standards', 'Configuration baselines', 'CIS benchmark configurations', 'Configuration compliance scans']),

('f0000004-0000-0000-0000-000000000001', 'd0004002-0000-0000-0000-000000000001', '2.2.4',
'Unnecessary Services Disabled',
'Only necessary services, protocols, daemons, and functions are enabled.',
'Disable unnecessary services.',
'Service inventory, disabled service evidence.',
ARRAY['Enabled services inventory', 'Disabled services documentation', 'Justifications for enabled services', 'Port scan results']),

-- Requirement 3: Protect Stored Account Data
('f0000004-0000-0000-0000-000000000001', 'd0004003-0000-0000-0000-000000000001', '3.1.1',
'Data Retention Policy',
'All processes and mechanisms for protecting stored account data are defined, documented, and understood.',
'Define data retention and disposal procedures.',
'Data retention policy, disposal procedures.',
ARRAY['Data Retention Policy', 'Data disposal procedures', 'Retention schedules', 'Disposal certificates']),

('f0000004-0000-0000-0000-000000000001', 'd0004003-0000-0000-0000-000000000001', '3.3.1',
'SAD Not Stored After Authorization',
'Sensitive authentication data (SAD) is not retained after authorization.',
'Ensure SAD is not stored post-authorization.',
'SAD handling procedures, data flow analysis.',
ARRAY['SAD handling policy', 'Data storage analysis', 'Post-auth data review', 'Application code review']),

('f0000004-0000-0000-0000-000000000001', 'd0004003-0000-0000-0000-000000000001', '3.4.1',
'PAN Rendered Unreadable',
'PAN is rendered unreadable anywhere it is stored.',
'Encrypt or hash stored PAN.',
'Encryption configurations, hashing evidence.',
ARRAY['PAN encryption configurations', 'Tokenization evidence', 'Truncation rules', 'Hashing implementations']),

('f0000004-0000-0000-0000-000000000001', 'd0004003-0000-0000-0000-000000000001', '3.5.1',
'Access to Cryptographic Keys Restricted',
'Access to cryptographic keys is restricted to the fewest number of custodians necessary.',
'Restrict key access to custodians.',
'Key access controls, custodian list.',
ARRAY['Key custodian list', 'Key access controls', 'Dual control evidence', 'Key access logs']),

-- Requirement 4: Encrypt Cardholder Data in Transit
('f0000004-0000-0000-0000-000000000001', 'd0004004-0000-0000-0000-000000000001', '4.1.1',
'Strong Cryptography for Transmission',
'Strong cryptography is used to protect PAN during transmission over open, public networks.',
'Encrypt PAN in transit.',
'TLS configurations, encryption evidence.',
ARRAY['TLS configurations', 'Certificate inventory', 'Encryption protocols in use', 'Secure transmission logs']),

('f0000004-0000-0000-0000-000000000001', 'd0004004-0000-0000-0000-000000000001', '4.2.1',
'End-User Messaging Technology',
'PAN is protected with strong cryptography when sent via end-user messaging technologies.',
'Encrypt PAN in messages.',
'Email encryption, secure messaging.',
ARRAY['Email encryption policies', 'Secure messaging configurations', 'DLP rules for PAN', 'Encryption evidence']),

-- Requirement 5: Malware Protection
('f0000004-0000-0000-0000-000000000001', 'd0004005-0000-0000-0000-000000000001', '5.2.1',
'Anti-Malware Deployed',
'An anti-malware solution is deployed on all system components.',
'Deploy anti-malware on all systems.',
'Anti-malware deployment, coverage reports.',
ARRAY['Anti-malware inventory', 'Deployment coverage', 'Agent status reports', 'Protection configurations']),

('f0000004-0000-0000-0000-000000000001', 'd0004005-0000-0000-0000-000000000001', '5.3.1',
'Anti-Malware Active and Updated',
'Anti-malware mechanisms and solutions are kept current via automatic updates.',
'Keep anti-malware updated.',
'Update configurations, update logs.',
ARRAY['Auto-update configurations', 'Signature update logs', 'Version compliance reports', 'Update frequency evidence']),

('f0000004-0000-0000-0000-000000000001', 'd0004005-0000-0000-0000-000000000001', '5.3.3',
'Periodic Scans',
'Anti-malware solutions perform periodic scans and active or real-time scans.',
'Configure periodic and real-time scanning.',
'Scan configurations, scan reports.',
ARRAY['Scan schedules', 'Scan completion reports', 'Real-time protection configs', 'Malware detection logs']),

-- Requirement 6: Secure Development
('f0000004-0000-0000-0000-000000000001', 'd0004006-0000-0000-0000-000000000001', '6.2.1',
'Secure Development Training',
'Software development personnel are trained in secure development.',
'Train developers on secure coding.',
'Training records, secure coding training.',
ARRAY['Developer security training', 'Training completion records', 'Secure coding curriculum', 'Competency assessments']),

('f0000004-0000-0000-0000-000000000001', 'd0004006-0000-0000-0000-000000000001', '6.2.4',
'Code Review',
'Software engineering techniques or other methods are defined and in use to prevent or mitigate common software attacks.',
'Implement code review processes.',
'Code review procedures, review records.',
ARRAY['Code review procedures', 'Review records', 'SAST tool configurations', 'Vulnerability findings']),

('f0000004-0000-0000-0000-000000000001', 'd0004006-0000-0000-0000-000000000001', '6.3.1',
'Vulnerability Management',
'Security vulnerabilities are identified and managed.',
'Manage security vulnerabilities.',
'Vulnerability scanning, patch management.',
ARRAY['Vulnerability scan reports', 'Patch management records', 'Remediation tracking', 'Critical vulnerability SLAs']),

('f0000004-0000-0000-0000-000000000001', 'd0004006-0000-0000-0000-000000000001', '6.4.1',
'Web Application Protection',
'Web applications are protected against attacks.',
'Protect web applications.',
'WAF configurations, application testing.',
ARRAY['WAF configurations', 'WAF rules', 'Web application testing', 'OWASP Top 10 remediation']),

-- Requirement 7: Access Restriction
('f0000004-0000-0000-0000-000000000001', 'd0004007-0000-0000-0000-000000000001', '7.1.1',
'Access Control Policy',
'All access to system components and cardholder data is defined and assigned based on job classification and function.',
'Define access based on business need.',
'Access control policy, role definitions.',
ARRAY['Access Control Policy', 'Role definitions', 'Access matrices', 'Job function mappings']),

('f0000004-0000-0000-0000-000000000001', 'd0004007-0000-0000-0000-000000000001', '7.2.1',
'Access Control Systems',
'Access control systems are in place for system components.',
'Implement access control systems.',
'Access control configurations, system access controls.',
ARRAY['Access control system configs', 'RBAC implementations', 'Access control lists', 'Permission matrices']),

-- Requirement 8: User Identification and Authentication
('f0000004-0000-0000-0000-000000000001', 'd0004008-0000-0000-0000-000000000001', '8.2.1',
'Unique User IDs',
'All users are assigned a unique ID before access to system components is allowed.',
'Assign unique IDs to all users.',
'User ID policy, user inventory.',
ARRAY['User ID policy', 'User account inventory', 'Unique ID evidence', 'No shared accounts']),

('f0000004-0000-0000-0000-000000000001', 'd0004008-0000-0000-0000-000000000001', '8.3.1',
'Strong Authentication',
'Strong authentication is used for all user access to system components.',
'Implement strong authentication.',
'Authentication configurations, MFA evidence.',
ARRAY['Authentication policy', 'MFA configurations', 'Password requirements', 'Authentication logs']),

('f0000004-0000-0000-0000-000000000001', 'd0004008-0000-0000-0000-000000000001', '8.3.6',
'Password Complexity',
'Passwords/passphrases must meet minimum complexity requirements.',
'Enforce password complexity.',
'Password policy, complexity configurations.',
ARRAY['Password policy', 'Complexity configurations', 'AD/LDAP password settings', 'Password audit results']),

-- Requirement 9: Physical Security
('f0000004-0000-0000-0000-000000000001', 'd0004009-0000-0000-0000-000000000001', '9.1.1',
'Physical Security Controls',
'Physical access controls are defined, documented, and implemented.',
'Implement physical access controls.',
'Physical security policy, access controls.',
ARRAY['Physical Security Policy', 'Access control systems', 'Badge reader configurations', 'Physical security procedures']),

('f0000004-0000-0000-0000-000000000001', 'd0004009-0000-0000-0000-000000000001', '9.2.3',
'Visitor Management',
'Visitors are authorized and escorted in sensitive areas.',
'Manage visitor access.',
'Visitor procedures, visitor logs.',
ARRAY['Visitor management procedures', 'Visitor logs', 'Escort procedures', 'Badge management']),

-- Requirement 10: Logging and Monitoring
('f0000004-0000-0000-0000-000000000001', 'd0004010-0000-0000-0000-000000000001', '10.1.1',
'Audit Log Policy',
'Audit logs are enabled and active for all system components and cardholder data.',
'Enable comprehensive logging.',
'Logging policy, log configurations.',
ARRAY['Logging policy', 'Log configurations', 'Audit trail evidence', 'Log coverage inventory']),

('f0000004-0000-0000-0000-000000000001', 'd0004010-0000-0000-0000-000000000001', '10.2.1',
'Audit Log Contents',
'Audit logs capture all required events for all system components.',
'Log required events.',
'Log content requirements, sample logs.',
ARRAY['Required event list', 'Sample audit logs', 'Event logging configurations', 'Log completeness evidence']),

('f0000004-0000-0000-0000-000000000001', 'd0004010-0000-0000-0000-000000000001', '10.4.1',
'Time Synchronization',
'Time synchronization technology is implemented and kept current.',
'Synchronize system clocks.',
'NTP configurations, time sync evidence.',
ARRAY['NTP configurations', 'Time sync evidence', 'Time source documentation', 'Sync monitoring']),

('f0000004-0000-0000-0000-000000000001', 'd0004010-0000-0000-0000-000000000001', '10.5.1',
'Log Retention',
'Audit log history is retained for at least 12 months.',
'Retain logs for required period.',
'Log retention configurations, archived logs.',
ARRAY['Log retention policy', 'Retention configurations', 'Archived log samples', 'Retention compliance evidence']),

-- Requirement 11: Security Testing
('f0000004-0000-0000-0000-000000000001', 'd0004011-0000-0000-0000-000000000001', '11.2.1',
'Wireless Analysis',
'Authorized and unauthorized wireless access points are managed.',
'Detect and manage wireless APs.',
'Wireless scanning, AP inventory.',
ARRAY['Wireless scanning results', 'Authorized AP inventory', 'Rogue AP detection', 'Wireless assessments']),

('f0000004-0000-0000-0000-000000000001', 'd0004011-0000-0000-0000-000000000001', '11.3.1',
'Vulnerability Scanning',
'Internal and external vulnerabilities are regularly identified, prioritized, and addressed.',
'Conduct regular vulnerability scans.',
'Vulnerability scans, remediation tracking.',
ARRAY['Internal scan reports', 'External scan reports (ASV)', 'Remediation tracking', 'Scan schedules']),

('f0000004-0000-0000-0000-000000000001', 'd0004011-0000-0000-0000-000000000001', '11.4.1',
'Penetration Testing',
'External and internal penetration testing is regularly performed.',
'Conduct penetration testing.',
'Penetration test reports, remediation.',
ARRAY['Penetration test reports', 'Testing methodology', 'Remediation evidence', 'Test schedules']),

-- Requirement 12: Security Policy
('f0000004-0000-0000-0000-000000000001', 'd0004012-0000-0000-0000-000000000001', '12.1.1',
'Information Security Policy',
'An overall information security policy is established, published, maintained, and disseminated to all relevant personnel.',
'Establish comprehensive security policy.',
'Information security policy, dissemination evidence.',
ARRAY['Information Security Policy', 'Policy distribution', 'Acknowledgments', 'Review records']),

('f0000004-0000-0000-0000-000000000001', 'd0004012-0000-0000-0000-000000000001', '12.3.1',
'Risk Assessment',
'A risk assessment is performed at least annually and upon significant changes.',
'Conduct annual risk assessments.',
'Risk assessment reports, annual reviews.',
ARRAY['Annual risk assessment', 'Risk register', 'Change-triggered assessments', 'Risk treatment plans']),

('f0000004-0000-0000-0000-000000000001', 'd0004012-0000-0000-0000-000000000001', '12.6.1',
'Security Awareness Program',
'A formal security awareness program is implemented.',
'Implement security awareness program.',
'Awareness program, training records.',
ARRAY['Security Awareness Program', 'Training materials', 'Completion records', 'Awareness metrics']),

('f0000004-0000-0000-0000-000000000001', 'd0004012-0000-0000-0000-000000000001', '12.10.1',
'Incident Response Plan',
'An incident response plan exists and is ready to be activated immediately.',
'Establish incident response capability.',
'Incident response plan, team roster.',
ARRAY['Incident Response Plan', 'IR team roster', 'Contact procedures', 'Escalation procedures'])

ON CONFLICT (framework_id, code) DO UPDATE SET
    description = EXCLUDED.description,
    guidance = EXCLUDED.guidance,
    evidence_requirements = EXCLUDED.evidence_requirements,
    evidence_examples = EXCLUDED.evidence_examples;
