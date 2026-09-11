CREATE TABLE IF NOT EXISTS doctor_qualifications (

    doctor_id UUID NOT NULL,

    qualification_id UUID NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (
        doctor_id,
        qualification_id
    ),

    CONSTRAINT fk_doctor_qualifications_doctor
        FOREIGN KEY (doctor_id)
        REFERENCES doctors(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_doctor_qualifications_qualification
        FOREIGN KEY (qualification_id)
        REFERENCES qualifications(id)
        ON DELETE RESTRICT
);


CREATE INDEX IF NOT EXISTS idx_doctor_qualifications_qualification
ON doctor_qualifications (
    qualification_id
);