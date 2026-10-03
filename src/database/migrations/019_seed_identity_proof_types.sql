INSERT INTO identity_proof_types (
    code,
    name,
    description,
    is_active,
    sort_order
)
VALUES
(
    'AADHAAR',
    'Aadhaar',
    'Aadhaar identity proof.',
    TRUE,
    1
),
(
    'PAN',
    'PAN',
    'Permanent Account Number identity proof.',
    TRUE,
    2
),
(
    'PASSPORT',
    'Passport',
    'Passport identity proof.',
    TRUE,
    3
),
(
    'DRIVING_LICENSE',
    'Driving License',
    'Driving license identity proof.',
    TRUE,
    4
),
(
    'VOTER_ID',
    'Voter ID',
    'Voter identification card.',
    TRUE,
    5
)
ON CONFLICT (code) DO NOTHING;