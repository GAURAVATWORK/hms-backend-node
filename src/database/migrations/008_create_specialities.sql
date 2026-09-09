CREATE TABLE IF NOT EXISTS specialities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    code VARCHAR(50) NOT NULL UNIQUE,

    name VARCHAR(150) NOT NULL UNIQUE,

    description TEXT,

    image_key VARCHAR(500),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_specialities_code
        CHECK (code ~ '^[A-Z0-9_]+$'),

    CONSTRAINT chk_specialities_name
        CHECK (BTRIM(name) <> ''),

    CONSTRAINT chk_specialities_sort_order
        CHECK (sort_order >= 0)
);

CREATE INDEX IF NOT EXISTS idx_specialities_active_sort
ON specialities (
    is_active,
    sort_order,
    name
);