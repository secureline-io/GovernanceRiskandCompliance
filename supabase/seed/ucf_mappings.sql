-- ============================================
-- GRC Platform - UCF-to-Framework Requirement Mappings
-- Maps UCF controls to SOC2 and ISO27001 requirements
-- Total: ~124 mappings (93 SOC2, 31 ISO27001)
-- ============================================

-- Framework UUID constants used throughout:
-- SOC2:     550e8400-e29b-41d4-a716-446655440001
-- ISO27001: 550e8400-e29b-41d4-a716-446655440002

-- ============================================
-- SOC2 CC1: Control Environment
-- ============================================

-- CC1.1 - Integrity and Ethical Values
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-GV-008'),
  (SELECT id FROM framework_requirements WHERE code = 'CC1.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Ethics and code of conduct directly supports commitment to integrity and ethical values'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-GV-008')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC1.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-GV-001'),
  (SELECT id FROM framework_requirements WHERE code = 'CC1.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'partial',
  'Security policy establishes organizational tone for integrity'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-GV-001')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC1.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- CC1.2 - Board Exercises Oversight
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-GV-004'),
  (SELECT id FROM framework_requirements WHERE code = 'CC1.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Board oversight control directly addresses board governance responsibilities'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-GV-004')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC1.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- CC1.3 - Structure, Authority, Responsibility
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-GV-002'),
  (SELECT id FROM framework_requirements WHERE code = 'CC1.3' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Roles and responsibilities define organizational structure and authority'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-GV-002')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC1.3' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-GV-010'),
  (SELECT id FROM framework_requirements WHERE code = 'CC1.3' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'partial',
  'Security committee supports oversight structure and reporting lines'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-GV-010')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC1.3' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- CC1.4 - Commitment to Competence
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-GV-003'),
  (SELECT id FROM framework_requirements WHERE code = 'CC1.4' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Awareness training demonstrates commitment to developing competent personnel'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-GV-003')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC1.4' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- CC1.5 - Enforces Accountability
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-GV-009'),
  (SELECT id FROM framework_requirements WHERE code = 'CC1.5' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Performance measurement enables accountability for control responsibilities'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-GV-009')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC1.5' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- ============================================
-- SOC2 CC2: Communication and Information
-- ============================================

-- CC2.1 - Uses Relevant Information
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-SO-002'),
  (SELECT id FROM framework_requirements WHERE code = 'CC2.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Log management generates relevant, quality information for internal controls'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-SO-002')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC2.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-SO-011'),
  (SELECT id FROM framework_requirements WHERE code = 'CC2.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'partial',
  'Security metrics provide quality information for decision-making'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-SO-011')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC2.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- CC2.2 - Communicates Internally
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-GV-003'),
  (SELECT id FROM framework_requirements WHERE code = 'CC2.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Awareness training communicates security objectives and responsibilities internally'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-GV-003')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC2.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-GV-007'),
  (SELECT id FROM framework_requirements WHERE code = 'CC2.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'partial',
  'Regulatory tracking communicates compliance obligations internally'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-GV-007')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC2.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- CC2.3 - Communicates Externally
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-IR-005'),
  (SELECT id FROM framework_requirements WHERE code = 'CC2.3' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'partial',
  'Incident communication addresses external communication of security events'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-IR-005')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC2.3' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-BC-007'),
  (SELECT id FROM framework_requirements WHERE code = 'CC2.3' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'partial',
  'Crisis communications covers external stakeholder communication during disruptions'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-BC-007')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC2.3' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- ============================================
-- SOC2 CC3: Risk Assessment
-- ============================================

-- CC3.1 - Specifies Suitable Objectives
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-RM-006'),
  (SELECT id FROM framework_requirements WHERE code = 'CC3.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Risk appetite defines objectives and acceptable risk levels'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-RM-006')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC3.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- CC3.2 - Identifies and Analyzes Risk
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-RM-001'),
  (SELECT id FROM framework_requirements WHERE code = 'CC3.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Risk assessment methodology provides structured approach to identifying and analyzing risks'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-RM-001')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC3.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-RM-002'),
  (SELECT id FROM framework_requirements WHERE code = 'CC3.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Risk identification process directly identifies risks to organizational objectives'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-RM-002')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC3.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-RM-003'),
  (SELECT id FROM framework_requirements WHERE code = 'CC3.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Risk analysis and scoring quantifies identified risks for prioritization'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-RM-003')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC3.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- CC3.3 - Assesses Fraud Risk
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-AC-015'),
  (SELECT id FROM framework_requirements WHERE code = 'CC3.3' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'partial',
  'Segregation of duties is a key control for mitigating fraud risk'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-AC-015')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC3.3' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-SO-004'),
  (SELECT id FROM framework_requirements WHERE code = 'CC3.3' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'partial',
  'Threat detection helps identify potential fraudulent activity'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-SO-004')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC3.3' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- CC3.4 - Identifies Significant Change
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-RM-008'),
  (SELECT id FROM framework_requirements WHERE code = 'CC3.4' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Emerging risk management identifies and assesses changes impacting internal controls'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-RM-008')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC3.4' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-CM-002'),
  (SELECT id FROM framework_requirements WHERE code = 'CC3.4' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'partial',
  'Change impact assessment evaluates how changes affect control environment'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-CM-002')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC3.4' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- ============================================
-- SOC2 CC4: Monitoring Activities
-- ============================================

-- CC4.1 - Ongoing/Separate Evaluations
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-SO-001'),
  (SELECT id FROM framework_requirements WHERE code = 'CC4.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Continuous monitoring provides ongoing evaluation of internal controls'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-SO-001')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC4.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-GV-006'),
  (SELECT id FROM framework_requirements WHERE code = 'CC4.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Internal audit performs separate evaluations of control effectiveness'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-GV-006')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC4.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- CC4.2 - Evaluates and Communicates Deficiencies
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-RM-007'),
  (SELECT id FROM framework_requirements WHERE code = 'CC4.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Risk reporting communicates deficiencies to management and the board'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-RM-007')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC4.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-GV-005'),
  (SELECT id FROM framework_requirements WHERE code = 'CC4.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'partial',
  'Compliance monitoring identifies and escalates control deficiencies'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-GV-005')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC4.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- ============================================
-- SOC2 CC5: Control Activities
-- ============================================

-- CC5.1 - Selects and Develops Control Activities
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-RM-004'),
  (SELECT id FROM framework_requirements WHERE code = 'CC5.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Risk treatment plans select and develop control activities to mitigate risks'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-RM-004')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC5.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- CC5.2 - General Controls over Technology
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-CM-008'),
  (SELECT id FROM framework_requirements WHERE code = 'CC5.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Configuration management is a foundational general IT control'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-CM-008')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC5.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-CM-009'),
  (SELECT id FROM framework_requirements WHERE code = 'CC5.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'partial',
  'Version control supports general IT control environment'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-CM-009')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC5.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- CC5.3 - Deploys Through Policies and Procedures
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-GV-001'),
  (SELECT id FROM framework_requirements WHERE code = 'CC5.3' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Security policy establishes expectations and procedures for control activities'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-GV-001')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC5.3' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- ============================================
-- SOC2 CC6: Logical and Physical Access Controls
-- ============================================

-- CC6.1 - Logical Access Security
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-AC-002'),
  (SELECT id FROM framework_requirements WHERE code = 'CC6.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'MFA is a key logical access security control for protected information assets'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-AC-002')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC6.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-AC-012'),
  (SELECT id FROM framework_requirements WHERE code = 'CC6.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Network access control implements logical access security architecture'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-AC-012')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC6.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-NS-001'),
  (SELECT id FROM framework_requirements WHERE code = 'CC6.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'partial',
  'Firewall management protects system boundaries as part of logical access architecture'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-NS-001')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC6.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- CC6.2 - User Registration and Authorization
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-AC-001'),
  (SELECT id FROM framework_requirements WHERE code = 'CC6.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Identity lifecycle management governs user registration and identity creation'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-AC-001')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC6.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-AC-003'),
  (SELECT id FROM framework_requirements WHERE code = 'CC6.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Access provisioning ensures proper authorization before granting system access'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-AC-003')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC6.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- CC6.3 - User Access Removal
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-AC-004'),
  (SELECT id FROM framework_requirements WHERE code = 'CC6.3' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Access deprovisioning directly addresses timely removal of access rights'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-AC-004')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC6.3' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-AC-006'),
  (SELECT id FROM framework_requirements WHERE code = 'CC6.3' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'partial',
  'Periodic access reviews identify and remove inappropriate access'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-AC-006')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC6.3' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- CC6.4 - Physical Access Restrictions
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-PS-001'),
  (SELECT id FROM framework_requirements WHERE code = 'CC6.4' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Facility access control restricts physical access to authorized personnel'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-PS-001')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC6.4' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-PS-002'),
  (SELECT id FROM framework_requirements WHERE code = 'CC6.4' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'partial',
  'Visitor management extends physical access controls to non-employees'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-PS-002')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC6.4' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-PS-006'),
  (SELECT id FROM framework_requirements WHERE code = 'CC6.4' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'partial',
  'Surveillance monitoring supports enforcement of physical access restrictions'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-PS-006')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC6.4' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- CC6.5 - Disposal of Information Assets
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-DP-007'),
  (SELECT id FROM framework_requirements WHERE code = 'CC6.5' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Secure disposal ensures data cannot be recovered from decommissioned assets'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-DP-007')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC6.5' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-PS-005'),
  (SELECT id FROM framework_requirements WHERE code = 'CC6.5' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'partial',
  'Physical secure disposal addresses hardware and media decommissioning'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-PS-005')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC6.5' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- CC6.6 - External Threats
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-NS-001'),
  (SELECT id FROM framework_requirements WHERE code = 'CC6.6' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Firewall management protects against external threats at system boundaries'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-NS-001')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC6.6' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-NS-003'),
  (SELECT id FROM framework_requirements WHERE code = 'CC6.6' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'IDS/IPS detects and prevents external intrusion attempts'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-NS-003')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC6.6' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-NS-007'),
  (SELECT id FROM framework_requirements WHERE code = 'CC6.6' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'partial',
  'DDoS protection mitigates volumetric external threats'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-NS-007')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC6.6' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- CC6.7 - Transmission Data Protection
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-DP-003'),
  (SELECT id FROM framework_requirements WHERE code = 'CC6.7' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Encryption in transit protects data during transmission'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-DP-003')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC6.7' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-DP-005'),
  (SELECT id FROM framework_requirements WHERE code = 'CC6.7' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'partial',
  'DLP prevents unauthorized transmission and movement of sensitive data'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-DP-005')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC6.7' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- CC6.8 - Malicious Software Prevention
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-SO-008'),
  (SELECT id FROM framework_requirements WHERE code = 'CC6.8' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Malware prevention directly addresses detection and prevention of malicious software'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-SO-008')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC6.8' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-SO-007'),
  (SELECT id FROM framework_requirements WHERE code = 'CC6.8' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'partial',
  'Endpoint protection provides host-level defense against malicious software'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-SO-007')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC6.8' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- ============================================
-- SOC2 CC7: System Operations
-- ============================================

-- CC7.1 - Security Event Detection
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-SO-005'),
  (SELECT id FROM framework_requirements WHERE code = 'CC7.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Vulnerability management detects new vulnerabilities and configuration weaknesses'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-SO-005')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC7.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-SO-009'),
  (SELECT id FROM framework_requirements WHERE code = 'CC7.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'partial',
  'Security scanning identifies configuration changes that introduce vulnerabilities'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-SO-009')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC7.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- CC7.2 - Security Event Monitoring
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-SO-003'),
  (SELECT id FROM framework_requirements WHERE code = 'CC7.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'SIEM provides centralized monitoring for security anomalies and events'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-SO-003')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC7.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-SO-012'),
  (SELECT id FROM framework_requirements WHERE code = 'CC7.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'partial',
  'Threat intelligence enriches monitoring with external threat context'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-SO-012')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC7.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- CC7.3 - Security Event Evaluation
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-IR-001'),
  (SELECT id FROM framework_requirements WHERE code = 'CC7.3' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Detection and triage evaluates security events to determine impact and severity'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-IR-001')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC7.3' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-IR-002'),
  (SELECT id FROM framework_requirements WHERE code = 'CC7.3' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'partial',
  'Incident classification supports structured evaluation and prioritization of events'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-IR-002')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC7.3' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- CC7.4 - Security Event Response
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-IR-003'),
  (SELECT id FROM framework_requirements WHERE code = 'CC7.4' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Containment procedures are a core part of the incident response program'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-IR-003')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC7.4' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-IR-005'),
  (SELECT id FROM framework_requirements WHERE code = 'CC7.4' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'partial',
  'Incident communication supports response coordination and stakeholder notification'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-IR-005')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC7.4' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- CC7.5 - Incident Recovery
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-IR-004'),
  (SELECT id FROM framework_requirements WHERE code = 'CC7.5' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Eradication and recovery directly addresses recovery from security incidents'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-IR-004')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC7.5' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-IR-006'),
  (SELECT id FROM framework_requirements WHERE code = 'CC7.5' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'partial',
  'Post-incident review identifies improvements to prevent recurrence'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-IR-006')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC7.5' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- ============================================
-- SOC2 CC8: Change Management
-- ============================================

-- CC8.1 - Infrastructure, Data, and Software Changes
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-CM-001'),
  (SELECT id FROM framework_requirements WHERE code = 'CC8.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Change request process governs authorization and documentation of changes'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-CM-001')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC8.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-CM-003'),
  (SELECT id FROM framework_requirements WHERE code = 'CC8.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Approval workflow ensures changes are authorized before implementation'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-CM-003')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC8.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-CM-004'),
  (SELECT id FROM framework_requirements WHERE code = 'CC8.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'partial',
  'Pre-deployment testing validates changes before production release'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-CM-004')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC8.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- ============================================
-- SOC2 CC9: Risk Mitigation
-- ============================================

-- CC9.1 - Business Continuity and Disaster Recovery
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-BC-001'),
  (SELECT id FROM framework_requirements WHERE code = 'CC9.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Business continuity plan directly mitigates risks from potential disruptions'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-BC-001')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC9.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-BC-002'),
  (SELECT id FROM framework_requirements WHERE code = 'CC9.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Disaster recovery plan provides technical recovery capabilities for business disruptions'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-BC-002')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC9.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- CC9.2 - Vendor Risk Management
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-VM-001'),
  (SELECT id FROM framework_requirements WHERE code = 'CC9.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Vendor risk assessment evaluates risks associated with third-party vendors'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-VM-001')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC9.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-VM-003'),
  (SELECT id FROM framework_requirements WHERE code = 'CC9.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'partial',
  'Contract security requirements formalize vendor risk management obligations'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-VM-003')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC9.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-VM-004'),
  (SELECT id FROM framework_requirements WHERE code = 'CC9.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'partial',
  'Ongoing vendor monitoring ensures continued management of vendor risks'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-VM-004')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'CC9.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- ============================================
-- SOC2 A: Availability
-- ============================================

-- A1.1 - System Availability / Capacity
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-BC-005'),
  (SELECT id FROM framework_requirements WHERE code = 'A1.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Redundancy and failover supports system availability and capacity management'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-BC-005')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'A1.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- A1.2 - Environmental Protections and Backup
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-PS-003'),
  (SELECT id FROM framework_requirements WHERE code = 'A1.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Environmental controls protect infrastructure from physical threats'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-PS-003')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'A1.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-DP-008'),
  (SELECT id FROM framework_requirements WHERE code = 'A1.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Backup and recovery processes protect data and enable system restoration'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-DP-008')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'A1.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- A1.3 - Recovery Testing
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-BC-004'),
  (SELECT id FROM framework_requirements WHERE code = 'A1.3' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Recovery testing validates DR and backup procedures meet recovery objectives'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-BC-004')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'A1.3' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- ============================================
-- SOC2 PI: Processing Integrity
-- ============================================

-- PI1.1 - System Processing Integrity
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-DP-011'),
  (SELECT id FROM framework_requirements WHERE code = 'PI1.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Data integrity controls ensure processing produces accurate and complete results'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-DP-011')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'PI1.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- PI1.2 - System Inputs Complete and Accurate
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-AS-005'),
  (SELECT id FROM framework_requirements WHERE code = 'PI1.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Input validation ensures system inputs are complete, accurate, and authorized'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-AS-005')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'PI1.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- PI1.3 - System Processing Complete and Accurate
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-AS-008'),
  (SELECT id FROM framework_requirements WHERE code = 'PI1.3' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'partial',
  'Application logging tracks processing completeness and identifies errors'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-AS-008')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'PI1.3' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- PI1.5 - Store Inputs/Outputs Completely and Accurately
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-DP-010'),
  (SELECT id FROM framework_requirements WHERE code = 'PI1.5' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'partial',
  'Database security supports complete and accurate storage of system data'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-DP-010')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'PI1.5' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- ============================================
-- SOC2 C: Confidentiality
-- ============================================

-- C1.1 - Confidential Information Identification
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-DP-001'),
  (SELECT id FROM framework_requirements WHERE code = 'C1.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Data classification identifies and categorizes confidential information'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-DP-001')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'C1.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-DP-002'),
  (SELECT id FROM framework_requirements WHERE code = 'C1.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'partial',
  'Encryption at rest protects identified confidential information in storage'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-DP-002')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'C1.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- C1.2 - Confidential Information Disposal
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-DP-006'),
  (SELECT id FROM framework_requirements WHERE code = 'C1.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Data retention policies govern the lifecycle and disposal of confidential information'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-DP-006')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'C1.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-DP-007'),
  (SELECT id FROM framework_requirements WHERE code = 'C1.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Secure disposal ensures confidential data is irrecoverably destroyed'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-DP-007')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'C1.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- ============================================
-- SOC2 P: Privacy
-- ============================================

-- P1.1 - Privacy Notice
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-PV-001'),
  (SELECT id FROM framework_requirements WHERE code = 'P1.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Privacy notice control directly maps to SOC2 privacy notice requirement'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-PV-001')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'P1.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- P2.1 - Choice and Consent
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-PV-002'),
  (SELECT id FROM framework_requirements WHERE code = 'P2.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Consent management addresses choice and consent for personal information'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-PV-002')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'P2.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- P3.1 - Collection of Personal Information
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-PV-008'),
  (SELECT id FROM framework_requirements WHERE code = 'P3.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Privacy by design ensures collection is limited and consistent with objectives'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-PV-008')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'P3.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- P3.2 - Explicit Consent for Sensitive Information
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-PV-002'),
  (SELECT id FROM framework_requirements WHERE code = 'P3.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Consent management handles explicit consent requirements for sensitive data'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-PV-002')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'P3.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- P4.2 - Retention of Personal Information
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-DP-006'),
  (SELECT id FROM framework_requirements WHERE code = 'P4.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Data retention policies govern how long personal information is kept'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-DP-006')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'P4.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- P4.3 - Disposal of Personal Information
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-DP-007'),
  (SELECT id FROM framework_requirements WHERE code = 'P4.3' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Secure disposal ensures personal information is properly destroyed'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-DP-007')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'P4.3' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- P5.1 - Third-Party Disclosure
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-PV-004'),
  (SELECT id FROM framework_requirements WHERE code = 'P5.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Data processing agreements govern third-party handling of personal information'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-PV-004')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'P5.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- P5.2 - Third-Party Privacy
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-PV-009'),
  (SELECT id FROM framework_requirements WHERE code = 'P5.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'partial',
  'Records of processing activities support tracking authorized disclosures'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-PV-009')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'P5.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- P6.2 - Access to Personal Information (DSR)
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-PV-003'),
  (SELECT id FROM framework_requirements WHERE code = 'P6.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Data subject requests enable individuals to access their personal information'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-PV-003')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'P6.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- P6.3 - Correction of Personal Information
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-PV-003'),
  (SELECT id FROM framework_requirements WHERE code = 'P6.3' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'partial',
  'Data subject request process includes handling rectification and correction requests'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-PV-003')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'P6.3' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- P7.1 - Security for Privacy
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-DP-012'),
  (SELECT id FROM framework_requirements WHERE code = 'P7.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'full',
  'Personal data protection provides security safeguards for privacy data throughout its lifecycle'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-DP-012')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'P7.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-DP-009'),
  (SELECT id FROM framework_requirements WHERE code = 'P7.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'partial',
  'Data masking and anonymization protect personal information during processing'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-DP-009')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'P7.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- P8.1 - Privacy Inquiry and Complaint Handling
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-PV-003'),
  (SELECT id FROM framework_requirements WHERE code = 'P8.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001'),
  'partial',
  'Data subject request process handles privacy inquiries and complaints'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-PV-003')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'P8.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440001');

-- ============================================
-- ISO 27001 MAPPINGS
-- ============================================

-- A.5.1 - Policies for Information Security
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-GV-001'),
  (SELECT id FROM framework_requirements WHERE code = 'A.5.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440002'),
  'full',
  'Security policy control directly addresses the requirement for defined and approved information security policies'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-GV-001')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'A.5.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440002');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-AC-008'),
  (SELECT id FROM framework_requirements WHERE code = 'A.5.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440002'),
  'partial',
  'Password policy is a topic-specific policy supporting the overall security policy framework'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-AC-008')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'A.5.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440002');

-- A.5.2 - Information Security Roles and Responsibilities
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-GV-002'),
  (SELECT id FROM framework_requirements WHERE code = 'A.5.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440002'),
  'full',
  'Roles and responsibilities control directly defines and allocates security roles'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-GV-002')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'A.5.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440002');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-GV-010'),
  (SELECT id FROM framework_requirements WHERE code = 'A.5.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440002'),
  'partial',
  'Security committee provides structure for senior-level security role allocation'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-GV-010')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'A.5.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440002');

-- A.5.3 - Segregation of Duties
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-AC-015'),
  (SELECT id FROM framework_requirements WHERE code = 'A.5.3' AND framework_id = '550e8400-e29b-41d4-a716-446655440002'),
  'full',
  'Segregation of duties control directly addresses the requirement to separate conflicting duties'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-AC-015')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'A.5.3' AND framework_id = '550e8400-e29b-41d4-a716-446655440002');

-- A.5.4 - Management Responsibilities
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-GV-004'),
  (SELECT id FROM framework_requirements WHERE code = 'A.5.4' AND framework_id = '550e8400-e29b-41d4-a716-446655440002'),
  'full',
  'Board oversight ensures management requires personnel to apply information security'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-GV-004')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'A.5.4' AND framework_id = '550e8400-e29b-41d4-a716-446655440002');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-GV-003'),
  (SELECT id FROM framework_requirements WHERE code = 'A.5.4' AND framework_id = '550e8400-e29b-41d4-a716-446655440002'),
  'partial',
  'Awareness training helps management ensure personnel understand and apply security policies'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-GV-003')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'A.5.4' AND framework_id = '550e8400-e29b-41d4-a716-446655440002');

-- A.5.5 - Contact with Authorities
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-GV-007'),
  (SELECT id FROM framework_requirements WHERE code = 'A.5.5' AND framework_id = '550e8400-e29b-41d4-a716-446655440002'),
  'full',
  'Regulatory tracking maintains contact with authorities and regulatory bodies'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-GV-007')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'A.5.5' AND framework_id = '550e8400-e29b-41d4-a716-446655440002');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-IR-005'),
  (SELECT id FROM framework_requirements WHERE code = 'A.5.5' AND framework_id = '550e8400-e29b-41d4-a716-446655440002'),
  'partial',
  'Incident communication includes notification to relevant authorities when required'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-IR-005')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'A.5.5' AND framework_id = '550e8400-e29b-41d4-a716-446655440002');

-- A.5.6 - Contact with Special Interest Groups
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-SO-012'),
  (SELECT id FROM framework_requirements WHERE code = 'A.5.6' AND framework_id = '550e8400-e29b-41d4-a716-446655440002'),
  'full',
  'Threat intelligence requires engagement with security forums and information sharing groups'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-SO-012')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'A.5.6' AND framework_id = '550e8400-e29b-41d4-a716-446655440002');

-- A.5.7 - Threat Intelligence
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-SO-012'),
  (SELECT id FROM framework_requirements WHERE code = 'A.5.7' AND framework_id = '550e8400-e29b-41d4-a716-446655440002'),
  'full',
  'Threat intelligence control directly addresses collection and analysis of threat information'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-SO-012')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'A.5.7' AND framework_id = '550e8400-e29b-41d4-a716-446655440002');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-SO-004'),
  (SELECT id FROM framework_requirements WHERE code = 'A.5.7' AND framework_id = '550e8400-e29b-41d4-a716-446655440002'),
  'partial',
  'Threat detection operationalizes threat intelligence through automated detection capabilities'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-SO-004')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'A.5.7' AND framework_id = '550e8400-e29b-41d4-a716-446655440002');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-RM-008'),
  (SELECT id FROM framework_requirements WHERE code = 'A.5.7' AND framework_id = '550e8400-e29b-41d4-a716-446655440002'),
  'related',
  'Emerging risk management leverages threat intelligence to identify new risk vectors'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-RM-008')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'A.5.7' AND framework_id = '550e8400-e29b-41d4-a716-446655440002');

-- A.5.8 - Information Security in Project Management
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-AS-001'),
  (SELECT id FROM framework_requirements WHERE code = 'A.5.8' AND framework_id = '550e8400-e29b-41d4-a716-446655440002'),
  'full',
  'Secure SDLC integrates security into software development project management'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-AS-001')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'A.5.8' AND framework_id = '550e8400-e29b-41d4-a716-446655440002');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-PV-005'),
  (SELECT id FROM framework_requirements WHERE code = 'A.5.8' AND framework_id = '550e8400-e29b-41d4-a716-446655440002'),
  'partial',
  'Privacy impact assessments integrate privacy considerations into project management'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-PV-005')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'A.5.8' AND framework_id = '550e8400-e29b-41d4-a716-446655440002');

-- A.6.1 - Screening
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-AC-001'),
  (SELECT id FROM framework_requirements WHERE code = 'A.6.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440002'),
  'partial',
  'Identity lifecycle management includes verification steps during onboarding that support screening'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-AC-001')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'A.6.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440002');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-VM-002'),
  (SELECT id FROM framework_requirements WHERE code = 'A.6.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440002'),
  'related',
  'Due diligence process extends screening concepts to third-party personnel and vendors'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-VM-002')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'A.6.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440002');

-- A.6.2 - Terms and Conditions of Employment
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-GV-002'),
  (SELECT id FROM framework_requirements WHERE code = 'A.6.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440002'),
  'partial',
  'Roles and responsibilities define security obligations that should be reflected in employment terms'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-GV-002')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'A.6.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440002');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-GV-008'),
  (SELECT id FROM framework_requirements WHERE code = 'A.6.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440002'),
  'partial',
  'Ethics and code of conduct establishes behavioral expectations that feed into employment agreements'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-GV-008')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'A.6.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440002');

-- A.8.1 - User Endpoint Devices
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-SO-007'),
  (SELECT id FROM framework_requirements WHERE code = 'A.8.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440002'),
  'full',
  'Endpoint protection secures user endpoint devices against threats'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-SO-007')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'A.8.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440002');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-PS-004'),
  (SELECT id FROM framework_requirements WHERE code = 'A.8.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440002'),
  'partial',
  'Equipment security addresses physical protection of endpoint devices'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-PS-004')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'A.8.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440002');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-DP-002'),
  (SELECT id FROM framework_requirements WHERE code = 'A.8.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440002'),
  'partial',
  'Encryption at rest protects data stored on endpoint devices'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-DP-002')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'A.8.1' AND framework_id = '550e8400-e29b-41d4-a716-446655440002');

-- A.8.2 - Privileged Access Rights
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-AC-005'),
  (SELECT id FROM framework_requirements WHERE code = 'A.8.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440002'),
  'full',
  'Privileged access management directly restricts and manages privileged access rights'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-AC-005')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'A.8.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440002');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-AC-010'),
  (SELECT id FROM framework_requirements WHERE code = 'A.8.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440002'),
  'partial',
  'Service account management restricts privileged access used by automated processes'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-AC-010')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'A.8.2' AND framework_id = '550e8400-e29b-41d4-a716-446655440002');

-- A.8.3 - Information Access Restriction
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-AC-003'),
  (SELECT id FROM framework_requirements WHERE code = 'A.8.3' AND framework_id = '550e8400-e29b-41d4-a716-446655440002'),
  'full',
  'Access provisioning enforces least-privilege access restrictions aligned with access control policy'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-AC-003')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'A.8.3' AND framework_id = '550e8400-e29b-41d4-a716-446655440002');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-AC-006'),
  (SELECT id FROM framework_requirements WHERE code = 'A.8.3' AND framework_id = '550e8400-e29b-41d4-a716-446655440002'),
  'partial',
  'Periodic access reviews verify information access restrictions remain appropriate'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-AC-006')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'A.8.3' AND framework_id = '550e8400-e29b-41d4-a716-446655440002');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-DP-001'),
  (SELECT id FROM framework_requirements WHERE code = 'A.8.3' AND framework_id = '550e8400-e29b-41d4-a716-446655440002'),
  'partial',
  'Data classification informs access restriction policies based on information sensitivity'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-DP-001')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'A.8.3' AND framework_id = '550e8400-e29b-41d4-a716-446655440002');

-- A.8.4 - Access to Source Code
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-CM-009'),
  (SELECT id FROM framework_requirements WHERE code = 'A.8.4' AND framework_id = '550e8400-e29b-41d4-a716-446655440002'),
  'full',
  'Version control manages read/write access to source code repositories'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-CM-009')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'A.8.4' AND framework_id = '550e8400-e29b-41d4-a716-446655440002');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-AS-002'),
  (SELECT id FROM framework_requirements WHERE code = 'A.8.4' AND framework_id = '550e8400-e29b-41d4-a716-446655440002'),
  'partial',
  'Code review processes ensure controlled access and oversight of source code changes'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-AS-002')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'A.8.4' AND framework_id = '550e8400-e29b-41d4-a716-446655440002');

-- A.8.5 - Secure Authentication
INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-AC-002'),
  (SELECT id FROM framework_requirements WHERE code = 'A.8.5' AND framework_id = '550e8400-e29b-41d4-a716-446655440002'),
  'full',
  'Multi-factor authentication implements secure authentication procedures'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-AC-002')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'A.8.5' AND framework_id = '550e8400-e29b-41d4-a716-446655440002');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-AC-007'),
  (SELECT id FROM framework_requirements WHERE code = 'A.8.5' AND framework_id = '550e8400-e29b-41d4-a716-446655440002'),
  'full',
  'SSO integration centralizes authentication with consistent security enforcement'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-AC-007')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'A.8.5' AND framework_id = '550e8400-e29b-41d4-a716-446655440002');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-AC-008'),
  (SELECT id FROM framework_requirements WHERE code = 'A.8.5' AND framework_id = '550e8400-e29b-41d4-a716-446655440002'),
  'partial',
  'Password policy defines credential requirements as part of secure authentication'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-AC-008')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'A.8.5' AND framework_id = '550e8400-e29b-41d4-a716-446655440002');

INSERT INTO ucf_requirement_mappings (id, ucf_control_id, requirement_id, mapping_strength, mapping_notes)
SELECT gen_random_uuid(),
  (SELECT id FROM ucf_controls WHERE code = 'UCF-AC-011'),
  (SELECT id FROM framework_requirements WHERE code = 'A.8.5' AND framework_id = '550e8400-e29b-41d4-a716-446655440002'),
  'partial',
  'Session management controls authenticated session lifecycle and prevents hijacking'
WHERE EXISTS (SELECT 1 FROM ucf_controls WHERE code = 'UCF-AC-011')
  AND EXISTS (SELECT 1 FROM framework_requirements WHERE code = 'A.8.5' AND framework_id = '550e8400-e29b-41d4-a716-446655440002');
