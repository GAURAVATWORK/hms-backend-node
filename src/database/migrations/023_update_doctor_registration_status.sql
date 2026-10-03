ALTER TABLE doctors
    ALTER COLUMN doctor_registration_status DROP NOT NULL;

ALTER TABLE doctors
    ALTER COLUMN doctor_registration_status DROP DEFAULT;

ALTER TABLE doctors
    DROP CONSTRAINT IF EXISTS chk_doctors_registration_status;

ALTER TABLE doctors
    ADD CONSTRAINT chk_doctors_registration_status
    CHECK (
        doctor_registration_status IS NULL
        OR doctor_registration_status IN (
            'PENDING',
            'VERIFIED',
            'REJECTED'
        )
    );

ALTER TABLE doctors
    DROP CONSTRAINT IF EXISTS chk_verified_doctor_profile;

ALTER TABLE doctors
    ADD CONSTRAINT chk_verified_doctor_profile
    CHECK (
        doctor_registration_status IS NULL
        OR doctor_registration_status <> 'VERIFIED'
        OR (
            medical_registration_number IS NOT NULL
            AND offline_consultation_fee IS NOT NULL
        )
    );