CREATE TABLE IF NOT EXISTS doctor_specialities (

    doctor_id UUID NOT NULL,

    speciality_id UUID NOT NULL,

    is_primary BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (
        doctor_id,
        speciality_id
    ),

    CONSTRAINT fk_doctor_specialities_doctor
        FOREIGN KEY (doctor_id)
        REFERENCES doctors(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_doctor_specialities_speciality
        FOREIGN KEY (speciality_id)
        REFERENCES specialities(id)
        ON DELETE RESTRICT
);


CREATE INDEX IF NOT EXISTS idx_doctor_specialities_speciality
ON doctor_specialities (
    speciality_id
);


CREATE UNIQUE INDEX IF NOT EXISTS uq_doctor_primary_speciality
ON doctor_specialities (
    doctor_id
)
WHERE is_primary = TRUE;