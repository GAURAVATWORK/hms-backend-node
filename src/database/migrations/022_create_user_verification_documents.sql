CREATE TABLE IF NOT EXISTS user_verification_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    identity_proof_type_id UUID,

    verification_document_type_id UUID,

    qualification_id UUID,

    document_key VARCHAR(500) NOT NULL,

    original_file_name VARCHAR(255),

    mime_type VARCHAR(100),

    file_size_bytes BIGINT,

    verification_status VARCHAR(20),

    rejection_reason TEXT,

    reviewed_by UUID,

    reviewed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_user_verification_documents_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_user_verification_documents_identity_type
        FOREIGN KEY (identity_proof_type_id)
        REFERENCES identity_proof_types(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_user_verification_documents_document_type
        FOREIGN KEY (verification_document_type_id)
        REFERENCES verification_document_types(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_user_verification_documents_qualification
        FOREIGN KEY (qualification_id)
        REFERENCES qualifications(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_user_verification_documents_reviewer
        FOREIGN KEY (reviewed_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT chk_user_verification_documents_type
        CHECK (
            (
                identity_proof_type_id IS NOT NULL
                AND verification_document_type_id IS NULL
            )
            OR
            (
                identity_proof_type_id IS NULL
                AND verification_document_type_id IS NOT NULL
            )
        ),

    CONSTRAINT chk_user_verification_documents_status
        CHECK (
            verification_status IS NULL
            OR verification_status IN (
                'PENDING',
                'REJECTED',
                'VERIFIED'
            )
        ),

    CONSTRAINT chk_user_verification_documents_file_size
        CHECK (
            file_size_bytes IS NULL
            OR file_size_bytes >= 0
        ),

    CONSTRAINT chk_user_verification_documents_rejection_reason
        CHECK (
            verification_status <> 'REJECTED'
            OR (
                rejection_reason IS NOT NULL
                AND BTRIM(rejection_reason) <> ''
            )
        ),

CONSTRAINT chk_user_verification_documents_review
    CHECK (
        verification_status IS NULL
        OR verification_status = 'PENDING'
        OR (
            verification_status IN ('REJECTED', 'VERIFIED')
            AND reviewed_by IS NOT NULL
            AND reviewed_at IS NOT NULL
        )
    )
);

CREATE INDEX IF NOT EXISTS idx_user_verification_documents_user
ON user_verification_documents (user_id);

CREATE INDEX IF NOT EXISTS idx_user_verification_documents_status
ON user_verification_documents (verification_status);

CREATE INDEX IF NOT EXISTS idx_user_verification_documents_identity_type
ON user_verification_documents (identity_proof_type_id);

CREATE INDEX IF NOT EXISTS idx_user_verification_documents_document_type
ON user_verification_documents (verification_document_type_id);

CREATE INDEX IF NOT EXISTS idx_user_verification_documents_qualification
ON user_verification_documents (qualification_id);