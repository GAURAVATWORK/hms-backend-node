INSERT INTO verification_document_types (
    code,
    name,
    description,
    is_active,
    sort_order
)
VALUES
(
    'MEDICAL_REGISTRATION_CERTIFICATE',
    'Medical Registration Certificate',
    'Certificate or document proving the doctor medical registration.',
    TRUE,
    1
),
(
    'QUALIFICATION_CERTIFICATE',
    'Qualification Certificate',
    'Certificate supporting the doctor professional qualification.',
    TRUE,
    2
)
ON CONFLICT (code) DO NOTHING;

