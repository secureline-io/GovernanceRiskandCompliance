-- ============================================
-- GRC Platform - SOC 2 Type II Framework Seed Data
-- Complete Trust Services Criteria
-- ============================================

-- Insert SOC 2 Framework
INSERT INTO frameworks (id, code, name, version, authority, category, description, is_custom)
VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'SOC2',
  'SOC 2 Type II',
  '2017',
  'AICPA',
  'security',
  'Service Organization Control 2 Type II report based on AICPA Trust Services Criteria. Evaluates the design and operating effectiveness of controls over security, availability, processing integrity, confidentiality, and privacy.',
  false
);

-- ============================================
-- CC1: Control Environment (COSO Principle 1-5)
-- ============================================
INSERT INTO framework_requirements (framework_id, code, title, description, category, is_mandatory, sort_order) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'CC1.1', 'COSO Principle 1: Demonstrates Commitment to Integrity and Ethical Values', 'The entity demonstrates a commitment to integrity and ethical values.', 'Control Environment', true, 1),
('550e8400-e29b-41d4-a716-446655440001', 'CC1.2', 'COSO Principle 2: Board Exercises Oversight Responsibility', 'The board of directors demonstrates independence from management and exercises oversight of the development and performance of internal control.', 'Control Environment', true, 2),
('550e8400-e29b-41d4-a716-446655440001', 'CC1.3', 'COSO Principle 3: Establishes Structure, Authority, and Responsibility', 'Management establishes, with board oversight, structures, reporting lines, and appropriate authorities and responsibilities in the pursuit of objectives.', 'Control Environment', true, 3),
('550e8400-e29b-41d4-a716-446655440001', 'CC1.4', 'COSO Principle 4: Demonstrates Commitment to Competence', 'The entity demonstrates a commitment to attract, develop, and retain competent individuals in alignment with objectives.', 'Control Environment', true, 4),
('550e8400-e29b-41d4-a716-446655440001', 'CC1.5', 'COSO Principle 5: Enforces Accountability', 'The entity holds individuals accountable for their internal control responsibilities in the pursuit of objectives.', 'Control Environment', true, 5);

-- ============================================
-- CC2: Communication and Information (COSO Principle 13-15)
-- ============================================
INSERT INTO framework_requirements (framework_id, code, title, description, category, is_mandatory, sort_order) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'CC2.1', 'COSO Principle 13: Uses Relevant Information', 'The entity obtains or generates and uses relevant, quality information to support the functioning of internal control.', 'Communication and Information', true, 6),
('550e8400-e29b-41d4-a716-446655440001', 'CC2.2', 'COSO Principle 14: Communicates Internally', 'The entity internally communicates information, including objectives and responsibilities for internal control, necessary to support the functioning of internal control.', 'Communication and Information', true, 7),
('550e8400-e29b-41d4-a716-446655440001', 'CC2.3', 'COSO Principle 15: Communicates Externally', 'The entity communicates with external parties regarding matters affecting the functioning of internal control.', 'Communication and Information', true, 8);

-- ============================================
-- CC3: Risk Assessment (COSO Principle 6-9)
-- ============================================
INSERT INTO framework_requirements (framework_id, code, title, description, category, is_mandatory, sort_order) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'CC3.1', 'COSO Principle 6: Specifies Suitable Objectives', 'The entity specifies objectives with sufficient clarity to enable the identification and assessment of risks relating to objectives.', 'Risk Assessment', true, 9),
('550e8400-e29b-41d4-a716-446655440001', 'CC3.2', 'COSO Principle 7: Identifies and Analyzes Risk', 'The entity identifies risks to the achievement of its objectives across the entity and analyzes risks as a basis for determining how the risks should be managed.', 'Risk Assessment', true, 10),
('550e8400-e29b-41d4-a716-446655440001', 'CC3.3', 'COSO Principle 8: Assesses Fraud Risk', 'The entity considers the potential for fraud in assessing risks to the achievement of objectives.', 'Risk Assessment', true, 11),
('550e8400-e29b-41d4-a716-446655440001', 'CC3.4', 'COSO Principle 9: Identifies and Analyzes Significant Change', 'The entity identifies and assesses changes that could significantly impact the system of internal control.', 'Risk Assessment', true, 12);

-- ============================================
-- CC4: Monitoring Activities (COSO Principle 16-17)
-- ============================================
INSERT INTO framework_requirements (framework_id, code, title, description, category, is_mandatory, sort_order) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'CC4.1', 'COSO Principle 16: Selects, Develops, and Performs Ongoing and/or Separate Evaluations', 'The entity selects, develops, and performs ongoing and/or separate evaluations to ascertain whether the components of internal control are present and functioning.', 'Monitoring Activities', true, 13),
('550e8400-e29b-41d4-a716-446655440001', 'CC4.2', 'COSO Principle 17: Evaluates and Communicates Deficiencies', 'The entity evaluates and communicates internal control deficiencies in a timely manner to those parties responsible for taking corrective action, including senior management and the board of directors, as appropriate.', 'Monitoring Activities', true, 14);

-- ============================================
-- CC5: Control Activities (COSO Principle 10-12)
-- ============================================
INSERT INTO framework_requirements (framework_id, code, title, description, category, is_mandatory, sort_order) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'CC5.1', 'COSO Principle 10: Selects and Develops Control Activities', 'The entity selects and develops control activities that contribute to the mitigation of risks to the achievement of objectives to acceptable levels.', 'Control Activities', true, 15),
('550e8400-e29b-41d4-a716-446655440001', 'CC5.2', 'COSO Principle 11: Selects and Develops General Controls over Technology', 'The entity selects and develops general control activities over technology to support the achievement of objectives.', 'Control Activities', true, 16),
('550e8400-e29b-41d4-a716-446655440001', 'CC5.3', 'COSO Principle 12: Deploys Through Policies and Procedures', 'The entity deploys control activities through policies that establish what is expected and procedures that put policies into action.', 'Control Activities', true, 17);

-- ============================================
-- CC6: Logical and Physical Access Controls
-- ============================================
INSERT INTO framework_requirements (framework_id, code, title, description, category, is_mandatory, sort_order) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'CC6.1', 'Logical Access Security Software', 'The entity implements logical access security software, infrastructure, and architectures over protected information assets to protect them from security events.', 'Logical and Physical Access Controls', true, 18),
('550e8400-e29b-41d4-a716-446655440001', 'CC6.2', 'User Registration and Authorization', 'Prior to issuing system credentials and granting system access, the entity registers and authorizes new internal and external users.', 'Logical and Physical Access Controls', true, 19),
('550e8400-e29b-41d4-a716-446655440001', 'CC6.3', 'User Access Removal', 'The entity removes access to protected information assets when appropriate.', 'Logical and Physical Access Controls', true, 20),
('550e8400-e29b-41d4-a716-446655440001', 'CC6.4', 'Restrictions on Physical Access', 'The entity restricts physical access to facilities and protected information assets to authorized personnel.', 'Logical and Physical Access Controls', true, 21),
('550e8400-e29b-41d4-a716-446655440001', 'CC6.5', 'Disposal of Information Assets', 'The entity discontinues logical and physical protections over physical assets only after the ability to read or recover data and software from those assets has been diminished.', 'Logical and Physical Access Controls', true, 22),
('550e8400-e29b-41d4-a716-446655440001', 'CC6.6', 'External Threats', 'The entity implements logical access security measures to protect against threats from sources outside its system boundaries.', 'Logical and Physical Access Controls', true, 23),
('550e8400-e29b-41d4-a716-446655440001', 'CC6.7', 'Transmission Data Protection', 'The entity restricts the transmission, movement, and removal of information to authorized internal and external users and processes.', 'Logical and Physical Access Controls', true, 24),
('550e8400-e29b-41d4-a716-446655440001', 'CC6.8', 'Malicious Software Prevention', 'The entity implements controls to prevent or detect and act upon the introduction of unauthorized or malicious software.', 'Logical and Physical Access Controls', true, 25);

-- ============================================
-- CC7: System Operations
-- ============================================
INSERT INTO framework_requirements (framework_id, code, title, description, category, is_mandatory, sort_order) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'CC7.1', 'Security Event Detection', 'To meet its objectives, the entity uses detection and monitoring procedures to identify changes to configurations that result in the introduction of new vulnerabilities and susceptibilities to newly discovered vulnerabilities.', 'System Operations', true, 26),
('550e8400-e29b-41d4-a716-446655440001', 'CC7.2', 'Security Event Monitoring', 'The entity monitors system components and the operation of those components for anomalies that are indicative of malicious acts, natural disasters, and errors affecting the entity''s ability to meet its objectives.', 'System Operations', true, 27),
('550e8400-e29b-41d4-a716-446655440001', 'CC7.3', 'Security Event Evaluation', 'The entity evaluates security events to determine whether they could or have resulted in a failure of the entity to meet its objectives and, if so, takes action to prevent or address such failures.', 'System Operations', true, 28),
('550e8400-e29b-41d4-a716-446655440001', 'CC7.4', 'Security Event Response', 'The entity responds to identified security incidents by executing a defined incident response program to understand, contain, remediate, and communicate security incidents.', 'System Operations', true, 29),
('550e8400-e29b-41d4-a716-446655440001', 'CC7.5', 'Incident Recovery', 'The entity identifies, develops, and implements activities to recover from identified security incidents.', 'System Operations', true, 30);

-- ============================================
-- CC8: Change Management
-- ============================================
INSERT INTO framework_requirements (framework_id, code, title, description, category, is_mandatory, sort_order) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'CC8.1', 'Infrastructure, Data, and Software Changes', 'The entity authorizes, designs, develops or acquires, configures, documents, tests, approves, and implements changes to infrastructure, data, software, and procedures to meet its objectives.', 'Change Management', true, 31);

-- ============================================
-- CC9: Risk Mitigation
-- ============================================
INSERT INTO framework_requirements (framework_id, code, title, description, category, is_mandatory, sort_order) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'CC9.1', 'Business Continuity and Disaster Recovery', 'The entity identifies, selects, and develops risk mitigation activities for risks arising from potential business disruptions.', 'Risk Mitigation', true, 32),
('550e8400-e29b-41d4-a716-446655440001', 'CC9.2', 'Vendor Risk Management', 'The entity assesses and manages risks associated with vendors and business partners.', 'Risk Mitigation', true, 33);

-- ============================================
-- A: Availability (Additional Criteria)
-- ============================================
INSERT INTO framework_requirements (framework_id, code, title, description, category, is_mandatory, sort_order) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'A1.1', 'System Availability Objectives', 'The entity maintains, monitors, and evaluates current processing capacity and use of system components to manage capacity demand and to enable the implementation of additional capacity.', 'Availability', false, 34),
('550e8400-e29b-41d4-a716-446655440001', 'A1.2', 'Environmental Protections', 'The entity authorizes, designs, develops or acquires, implements, operates, approves, maintains, and monitors environmental protections, software, data backup processes, and recovery infrastructure.', 'Availability', false, 35),
('550e8400-e29b-41d4-a716-446655440001', 'A1.3', 'Recovery Testing', 'The entity tests recovery plan procedures supporting system recovery to meet its objectives.', 'Availability', false, 36);

-- ============================================
-- PI: Processing Integrity (Additional Criteria)
-- ============================================
INSERT INTO framework_requirements (framework_id, code, title, description, category, is_mandatory, sort_order) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'PI1.1', 'System Processing Integrity', 'The entity implements policies and procedures over system processing to result in products, services, and reporting to meet the entity''s objectives.', 'Processing Integrity', false, 37),
('550e8400-e29b-41d4-a716-446655440001', 'PI1.2', 'System Inputs are Complete and Accurate', 'The entity implements policies and procedures over system inputs to result in products, services, and reporting to meet the entity''s objectives.', 'Processing Integrity', false, 38),
('550e8400-e29b-41d4-a716-446655440001', 'PI1.3', 'System Processing is Complete and Accurate', 'The entity implements policies and procedures over system processing to result in products, services, and reporting to meet the entity''s objectives.', 'Processing Integrity', false, 39),
('550e8400-e29b-41d4-a716-446655440001', 'PI1.4', 'System Outputs are Complete and Accurate', 'The entity implements policies and procedures to make available or deliver output completely and accurately to meet the entity''s objectives.', 'Processing Integrity', false, 40),
('550e8400-e29b-41d4-a716-446655440001', 'PI1.5', 'Store Inputs and Outputs Completely and Accurately', 'The entity implements policies and procedures to store inputs and outputs completely, accurately, and timely in accordance with system specifications to meet the entity''s objectives.', 'Processing Integrity', false, 41);

-- ============================================
-- C: Confidentiality (Additional Criteria)
-- ============================================
INSERT INTO framework_requirements (framework_id, code, title, description, category, is_mandatory, sort_order) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'C1.1', 'Confidential Information Identification', 'The entity identifies and maintains confidential information to meet the entity''s objectives related to confidentiality.', 'Confidentiality', false, 42),
('550e8400-e29b-41d4-a716-446655440001', 'C1.2', 'Confidential Information Disposal', 'The entity disposes of confidential information to meet the entity''s objectives related to confidentiality.', 'Confidentiality', false, 43);

-- ============================================
-- P: Privacy (Additional Criteria)
-- ============================================
INSERT INTO framework_requirements (framework_id, code, title, description, category, is_mandatory, sort_order) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'P1.1', 'Privacy Notice', 'The entity provides notice to data subjects about its privacy practices.', 'Privacy', false, 44),
('550e8400-e29b-41d4-a716-446655440001', 'P2.1', 'Choice and Consent', 'The entity communicates choices available regarding the collection, use, retention, disclosure, and disposal of personal information.', 'Privacy', false, 45),
('550e8400-e29b-41d4-a716-446655440001', 'P3.1', 'Collection of Personal Information', 'Personal information is collected consistent with the entity''s objectives related to privacy.', 'Privacy', false, 46),
('550e8400-e29b-41d4-a716-446655440001', 'P3.2', 'Explicit Consent for Sensitive Information', 'For information requiring explicit consent, the entity communicates the need for such consent.', 'Privacy', false, 47),
('550e8400-e29b-41d4-a716-446655440001', 'P4.1', 'Use of Personal Information', 'The entity limits the use of personal information to the purposes identified in the notice and for which the data subject has provided implicit or explicit consent.', 'Privacy', false, 48),
('550e8400-e29b-41d4-a716-446655440001', 'P4.2', 'Retention of Personal Information', 'The entity retains personal information consistent with the entity''s objectives related to privacy.', 'Privacy', false, 49),
('550e8400-e29b-41d4-a716-446655440001', 'P4.3', 'Disposal of Personal Information', 'The entity securely disposes of personal information to meet the entity''s objectives related to privacy.', 'Privacy', false, 50),
('550e8400-e29b-41d4-a716-446655440001', 'P5.1', 'Third-Party Disclosure', 'The entity discloses personal information to third parties with the consent of the data subject only for the purposes identified in the notice.', 'Privacy', false, 51),
('550e8400-e29b-41d4-a716-446655440001', 'P5.2', 'Third-Party Privacy', 'The entity creates and retains a complete, accurate, and timely record of authorized disclosures of personal information.', 'Privacy', false, 52),
('550e8400-e29b-41d4-a716-446655440001', 'P6.1', 'Quality of Personal Information', 'The entity collects and maintains accurate, up-to-date, complete, and relevant personal information.', 'Privacy', false, 53),
('550e8400-e29b-41d4-a716-446655440001', 'P6.2', 'Access to Personal Information', 'The entity provides data subjects the ability to access their stored personal information for review and, upon request, provides the physical or electronic records of that personal information.', 'Privacy', false, 54),
('550e8400-e29b-41d4-a716-446655440001', 'P6.3', 'Correction of Personal Information', 'The entity corrects, amends, or appends personal information based on information provided by data subjects.', 'Privacy', false, 55),
('550e8400-e29b-41d4-a716-446655440001', 'P6.4', 'Appeal Regarding Personal Information', 'The entity provides a process for data subjects to appeal a refusal to provide access to or make corrections to their personal information.', 'Privacy', false, 56),
('550e8400-e29b-41d4-a716-446655440001', 'P6.5', 'Data Subject Account', 'The entity provides data subjects with the ability to opt out of the use of their personal information or the ability to use the service without the use of personal information.', 'Privacy', false, 57),
('550e8400-e29b-41d4-a716-446655440001', 'P6.6', 'Notification of Denied Requests', 'The entity notifies data subjects when a request to access, correct, or appeal regarding their personal information has been denied.', 'Privacy', false, 58),
('550e8400-e29b-41d4-a716-446655440001', 'P6.7', 'Third-Party Data Requests', 'The entity evaluates and handles requests to provide personal information to third parties according to established policies and procedures.', 'Privacy', false, 59),
('550e8400-e29b-41d4-a716-446655440001', 'P7.1', 'Security for Privacy', 'The entity collects, uses, retains, discloses, and disposes of personal information to meet the entity''s objectives related to privacy.', 'Privacy', false, 60),
('550e8400-e29b-41d4-a716-446655440001', 'P8.1', 'Privacy Inquiry, Complaint, and Dispute Handling', 'The entity implements a process for receiving, addressing, resolving, and communicating the resolution of inquiries, complaints, and disputes from data subjects.', 'Privacy', false, 61);

-- ============================================
-- ISO 27001 Framework (Additional)
-- ============================================
INSERT INTO frameworks (id, code, name, version, authority, category, description, is_custom)
VALUES (
  '550e8400-e29b-41d4-a716-446655440002',
  'ISO27001',
  'ISO/IEC 27001:2022',
  '2022',
  'ISO/IEC',
  'security',
  'International standard for information security management systems (ISMS). Provides requirements for establishing, implementing, maintaining and continually improving an information security management system.',
  false
);

-- ISO 27001 Annex A Controls (Simplified subset)
INSERT INTO framework_requirements (framework_id, code, title, description, category, is_mandatory, sort_order) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'A.5.1', 'Policies for Information Security', 'Information security policy and topic-specific policies shall be defined, approved by management, published, communicated to and acknowledged by relevant personnel and relevant interested parties.', 'Organizational Controls', true, 1),
('550e8400-e29b-41d4-a716-446655440002', 'A.5.2', 'Information Security Roles and Responsibilities', 'Information security roles and responsibilities shall be defined and allocated according to the organization needs.', 'Organizational Controls', true, 2),
('550e8400-e29b-41d4-a716-446655440002', 'A.5.3', 'Segregation of Duties', 'Conflicting duties and conflicting areas of responsibility shall be segregated.', 'Organizational Controls', true, 3),
('550e8400-e29b-41d4-a716-446655440002', 'A.5.4', 'Management Responsibilities', 'Management shall require all personnel to apply information security in accordance with the established information security policy, topic-specific policies and procedures of the organization.', 'Organizational Controls', true, 4),
('550e8400-e29b-41d4-a716-446655440002', 'A.5.5', 'Contact with Authorities', 'The organization shall establish and maintain contact with relevant authorities.', 'Organizational Controls', true, 5),
('550e8400-e29b-41d4-a716-446655440002', 'A.5.6', 'Contact with Special Interest Groups', 'The organization shall establish and maintain contact with special interest groups or other specialist security forums and professional associations.', 'Organizational Controls', true, 6),
('550e8400-e29b-41d4-a716-446655440002', 'A.5.7', 'Threat Intelligence', 'Information relating to information security threats shall be collected and analysed to produce threat intelligence.', 'Organizational Controls', true, 7),
('550e8400-e29b-41d4-a716-446655440002', 'A.5.8', 'Information Security in Project Management', 'Information security shall be integrated into project management.', 'Organizational Controls', true, 8),
('550e8400-e29b-41d4-a716-446655440002', 'A.6.1', 'Screening', 'Background verification checks on all candidates to become personnel shall be carried out prior to joining the organization.', 'People Controls', true, 9),
('550e8400-e29b-41d4-a716-446655440002', 'A.6.2', 'Terms and Conditions of Employment', 'The employment contractual agreements shall state the personnel''s and the organization''s responsibilities for information security.', 'People Controls', true, 10),
('550e8400-e29b-41d4-a716-446655440002', 'A.8.1', 'User Endpoint Devices', 'Information stored on, processed by or accessible via user endpoint devices shall be protected.', 'Technological Controls', true, 11),
('550e8400-e29b-41d4-a716-446655440002', 'A.8.2', 'Privileged Access Rights', 'The allocation and use of privileged access rights shall be restricted and managed.', 'Technological Controls', true, 12),
('550e8400-e29b-41d4-a716-446655440002', 'A.8.3', 'Information Access Restriction', 'Access to information and other associated assets shall be restricted in accordance with the established topic-specific policy on access control.', 'Technological Controls', true, 13),
('550e8400-e29b-41d4-a716-446655440002', 'A.8.4', 'Access to Source Code', 'Read and write access to source code, development tools and software libraries shall be appropriately managed.', 'Technological Controls', true, 14),
('550e8400-e29b-41d4-a716-446655440002', 'A.8.5', 'Secure Authentication', 'Secure authentication technologies and procedures shall be implemented based on information access restrictions and the topic-specific policy on access control.', 'Technological Controls', true, 15);
