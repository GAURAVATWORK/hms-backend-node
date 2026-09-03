
CREATE TABLE IF NOT EXISTS refresh_tokens (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

user_id UUID NOT NULL,
token_hash TEXT NOT NULL UNIQUE,
expires_at TIMESTAMPTZ NOT NULL,
revoked_at TIMESTAMPTZ,
replaced_by_token_id UUID,
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
CONSTRAINT fk_refresh_tokens_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

CONSTRAINT fk_refresh_tokens_replaced_by
     FOREIGN KEY (replaced_by_token_id)
     REFERENCES refresh_tokens(id)
     ON DELETE SET NULL

);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id
ON refresh_tokens(user_id);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at
ON refresh_tokens(expires_at);
