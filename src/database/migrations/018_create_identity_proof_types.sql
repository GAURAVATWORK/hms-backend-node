CREATE TABLE IF NOT EXISTS identity_proof_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    code VARCHAR(50) NOT NULL UNIQUE,

    name VARCHAR(100) NOT NULL UNIQUE,

    description TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_identity_proof_types_code
        CHECK (code ~ '^[A-Z0-9_]+$'),

    CONSTRAINT chk_identity_proof_types_name
        CHECK (BTRIM(name) <> ''),

    CONSTRAINT chk_identity_proof_types_sort_order
        CHECK (sort_order >= 0)
);


CREATE INDEX IF NOT EXISTS idx_identity_proof_types_active_sort
ON identity_proof_types (
    is_active,
    sort_order,
    name
);