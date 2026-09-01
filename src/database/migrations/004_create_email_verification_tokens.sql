CREATE TABLE IF NOT EXISTS email_verification_tokens(
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

user_id UUID NOT NULL,

token_hash TEXT NOT NULL UNIQUE,

expires_at TIMESTAMPTZ NOT NULL,

used_at TIMESTAMPTZ,

create_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

CONSTRAINT fk_email_verification_tokens_user
     FOREIGN KEY (user_id)
     REFERENCES users(id)
     ON DELETE CASCADE
);