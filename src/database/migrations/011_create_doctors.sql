CREATE TABLE IF NOT EXISTS doctors (

    user_id UUID PRIMARY KEY,

    doctor_number VARCHAR(50) NOT NULL UNIQUE,

    profile_photo_key VARCHAR(500),

    name VARCHAR(200) NOT NULL,

    date_of_birth DATE,

    gender VARCHAR(20),

    phone VARCHAR(20),

    experience_years INTEGER,

    medical_registration_number VARCHAR(100) UNIQUE,

    medical_registration_authority VARCHAR(150),

    bio TEXT,

    hospital_or_clinic_name VARCHAR(200),

    address_line_1 VARCHAR(255),
    address_line_2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),

    offline_consultation_fee NUMERIC(10,2),

    doctor_registration_status VARCHAR(20)
        NOT NULL DEFAULT 'PENDING',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),


    CONSTRAINT fk_doctors_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,


    CONSTRAINT chk_doctors_gender
        CHECK (
            gender IS NULL
            OR gender IN (
                'MALE',
                'FEMALE',
                'OTHER'
            )
        ),


    CONSTRAINT chk_doctors_experience_years
        CHECK (
            experience_years IS NULL
            OR experience_years >= 0
        ),


    CONSTRAINT chk_doctors_offline_fee
        CHECK (
            offline_consultation_fee IS NULL
            OR offline_consultation_fee >= 0
        ),


    CONSTRAINT chk_doctors_registration_status
        CHECK (
            doctor_registration_status IN (
                'PENDING',
                'VERIFIED',
                'REJECTED'
            )
        ),


    CONSTRAINT chk_verified_doctor_profile
        CHECK (
            doctor_registration_status <> 'VERIFIED'
            OR (
                medical_registration_number IS NOT NULL
                AND offline_consultation_fee IS NOT NULL
            )
        )
);


CREATE INDEX IF NOT EXISTS idx_doctors_registration_status
ON doctors (
    doctor_registration_status
);
