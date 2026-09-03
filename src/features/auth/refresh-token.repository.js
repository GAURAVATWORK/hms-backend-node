import pool from "../../config/database.js";

const createRefreshToken = async ({
    db = pool,
    userId,
    familyId,
    tokenHash,
    expiresAt
}) => {

    const result = await db.query(
        `
        INSERT INTO refresh_tokens (
            user_id,
            family_id,
            token_hash,
            expires_at
        )
        VALUES ($1, $2, $3, $4)
        RETURNING
            id,
            user_id,
            family_id,
            expires_at,
            revoked_at,
            replaced_by_token_id,
            created_at
        `,
        [
            userId,
            familyId,
            tokenHash,
            expiresAt
        ]
    );

    return result.rows[0];
};

const findRefreshTokenByHash = async ({
    db = pool,
    tokenHash,
    forUpdate = false
}) => {

    const result = await db.query(
        `
        SELECT
            id,
            user_id,
            family_id,
            token_hash,
            expires_at,
            revoked_at,
            replaced_by_token_id,
            created_at
        FROM refresh_tokens
        WHERE token_hash = $1
        ${forUpdate ? "FOR UPDATE" : ""}
        LIMIT 1
        `,
        [tokenHash]
    );

    return result.rows[0] ?? null;
};


const revokeRefreshToken = async ({
    db = pool,
    tokenId,
    replacedByTokenId = null
}) => {

    const result = await db.query(
        `
        UPDATE refresh_tokens
        SET
            revoked_at = NOW(),
            replaced_by_token_id = $2
        WHERE id = $1
          AND revoked_at IS NULL
        RETURNING
            id,
            user_id,
            revoked_at,
            replaced_by_token_id
        `,
        [
            tokenId,
            replacedByTokenId
        ]
    );

    return result.rows[0] ?? null;
};

const findUserForRefresh = async ({
    db = pool,
    userId
}) => {

    const result = await db.query(
        `
        SELECT
            id,
            role,
            is_active
        FROM users
        WHERE id = $1
        LIMIT 1
        `,
        [userId]
    );

    return result.rows[0] ?? null;
};

const revokeRefreshTokenFamily = async ({
    db = pool,
    familyId
}) => {

    const result = await db.query(
        `
        UPDATE refresh_tokens
        SET revoked_at = NOW()
        WHERE family_id = $1
          AND revoked_at IS NULL
        RETURNING id
        `,
        [familyId]
    );

    return result.rows;
};

export {
    createRefreshToken,
    findRefreshTokenByHash,
    revokeRefreshToken,
    findUserForRefresh,
    revokeRefreshTokenFamily

};