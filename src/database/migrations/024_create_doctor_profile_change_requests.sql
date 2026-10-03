CREATE TABLE IF NOT EXISTS doctor_profile_change_requests (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    doctor_id UUID NOT NULL,

    change_type VARCHAR(30) NOT NULL,

    requested_data JSONB NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',

    rejection_reason TEXT,

    reviewed_by UUID,

    reviewed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),


    CONSTRAINT fk_doctor_profile_change_requests_doctor
        FOREIGN KEY (doctor_id)
        REFERENCES doctors(user_id)
        ON DELETE CASCADE,


    CONSTRAINT fk_doctor_profile_change_requests_reviewer
        FOREIGN KEY (reviewed_by)
        REFERENCES users(id)
        ON DELETE SET NULL,


    CONSTRAINT chk_doctor_profile_change_requests_type
        CHECK (
            change_type IN (
                'PROFESSIONAL',
                'OFFLINE_FEE',
                'BANK'
            )
        ),


    CONSTRAINT chk_doctor_profile_change_requests_status
        CHECK (
            status IN (
                'PENDING',
                'APPROVED',
                'REJECTED'
            )
        ),


    CONSTRAINT chk_doctor_profile_change_requests_rejection
        CHECK (
            status <> 'REJECTED'
            OR (
                rejection_reason IS NOT NULL
                AND BTRIM(rejection_reason) <> ''
            )
        ),


    CONSTRAINT chk_doctor_profile_change_requests_review
        CHECK (
            status = 'PENDING'
            OR (
                reviewed_by IS NOT NULL
                AND reviewed_at IS NOT NULL
            )
        )
);


CREATE INDEX IF NOT EXISTS idx_doctor_profile_change_requests_doctor
ON doctor_profile_change_requests (doctor_id);


CREATE INDEX IF NOT EXISTS idx_doctor_profile_change_requests_status
ON doctor_profile_change_requests (status);


CREATE INDEX IF NOT EXISTS idx_doctor_profile_change_requests_type
ON doctor_profile_change_requests (change_type);


CREATE UNIQUE INDEX IF NOT EXISTS uq_doctor_profile_change_requests_pending
ON doctor_profile_change_requests (
    doctor_id,
    change_type
)
WHERE status = 'PENDING';
