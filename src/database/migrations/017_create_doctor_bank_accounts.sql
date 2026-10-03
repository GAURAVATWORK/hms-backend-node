CREATE TABLE IF NOT EXISTS doctor_bank_accounts (
    doctor_id UUID PRIMARY KEY,
    account_holder_name VARCHAR(200) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    ifsc_code VARCHAR(20) NOT NULL,
    bank_name VARCHAR(150) NOT NULL,
    branch_name VARCHAR(150) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_doctor_bank_accounts_doctor
        FOREIGN KEY (doctor_id)
        REFERENCES doctors(user_id)
        ON DELETE CASCADE,

    CONSTRAINT chk_doctor_bank_accounts_ifsc
        CHECK(
            BTRIM(ifsc_code) <> ''
        )
 );