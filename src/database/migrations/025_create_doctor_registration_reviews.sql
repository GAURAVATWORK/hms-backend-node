
BEGIN;

-- Track which uploaded document is currently used for each requirement.
ALTER TABLE user_verification_documents
ADD COLUMN is_current BOOLEAN NOT NULL DEFAULT TRUE;

-- Keep only the newest existing document current for each requirement.
WITH ranked_documents AS (
    SELECT
        id,
        ROW_NUMBER() OVER (
            PARTITION BY
                user_id,
                identity_proof_type_id,
                verification_document_type_id,
                qualification_id
            ORDER BY created_at DESC, id DESC
        ) AS row_number
    FROM user_verification_documents
)
UPDATE user_verification_documents AS document
SET is_current = (ranked_documents.row_number = 1)
FROM ranked_documents
WHERE document.id = ranked_documents.id;

-- A user can have only one current document per identity-proof type.
CREATE UNIQUE INDEX uq_current_identity_proof
ON user_verification_documents (
    user_id,
    identity_proof_type_id
)
WHERE is_current = TRUE
  AND identity_proof_type_id IS NOT NULL;

-- A user can have only one current document for each
-- verification-document type and qualification combination.
CREATE UNIQUE INDEX uq_current_verification_document
ON user_verification_documents (
    user_id,
    verification_document_type_id,
    COALESCE(qualification_id, '00000000-0000-0000-0000-000000000000'::uuid)
)
WHERE is_current = TRUE
  AND verification_document_type_id IS NOT NULL;

-- Store initial-registration review history for profile sections.
CREATE TABLE doctor_registration_item_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    doctor_id UUID NOT NULL
        REFERENCES doctors(user_id) ON DELETE CASCADE,

    item_type VARCHAR(40) NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',

    rejection_reason TEXT,

    reviewed_by UUID
        REFERENCES users(id) ON DELETE SET NULL,

    reviewed_at TIMESTAMPTZ,

    is_current BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_doctor_registration_review_item_type
        CHECK (
            item_type IN (
                'PROFESSIONAL_DETAILS',
                'OFFLINE_CONSULTATION_FEE',
                'BANK_DETAILS'
            )
        ),

    CONSTRAINT chk_doctor_registration_review_status
        CHECK (status IN ('PENDING', 'VERIFIED', 'REJECTED')),

    CONSTRAINT chk_doctor_registration_review_rejection
        CHECK (
            status <> 'REJECTED'
            OR (
                rejection_reason IS NOT NULL
                AND BTRIM(rejection_reason) <> ''
            )
        ),

    CONSTRAINT chk_doctor_registration_review_metadata
        CHECK (
            status = 'PENDING'
            OR (
                reviewed_by IS NOT NULL
                AND reviewed_at IS NOT NULL
            )
        )
);

-- Only one current review record per doctor and profile section.
CREATE UNIQUE INDEX uq_current_doctor_registration_item_review
ON doctor_registration_item_reviews (doctor_id, item_type)
WHERE is_current = TRUE;

CREATE INDEX idx_doctor_registration_reviews_doctor
ON doctor_registration_item_reviews (doctor_id, created_at DESC);

COMMIT;

