CREATE TABLE IF NOT EXISTS patients (
    user_id UUID PRIMARY KEY,

    patient_number VARCHAR(50) NOT NULL UNIQUE,

    profile_photo_url TEXT,

    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,

    date_of_birth DATE,

    gender VARCHAR(20),

    phone VARCHAR(20),

    address_line_1 VARCHAR(255),
    address_line_2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),

    blood_group VARCHAR(5),

    emergency_contact_name VARCHAR(150),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(50),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_patients_user
        FOREIGN KEY (user_id)
        REFERENCES users(id),

    CONSTRAINT chk_patients_gender
        CHECK (
            gender IS NULL
            OR gender IN ('MALE', 'FEMALE', 'OTHER')
        ),

    CONSTRAINT chk_patients_blood_group
        CHECK (
            blood_group IS NULL
            OR blood_group IN (
                'A+',
                'A-',
                'B+',
                'B-',
                'AB+',
                'AB-',
                'O+',
                'O-'
            )
        )
);