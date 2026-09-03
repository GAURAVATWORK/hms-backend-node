import pool from "../../config/database.js";

import jwtConfig from "../../config/jwt.js";

import {
    generateAccessToken
} from "../../utils/jwt.js";

import {
    generateRefreshToken,
    hashRefreshToken
} from "../../utils/refresh-token.js";

import {
    calculateExpiration
} from "../../utils/expiration.js";

import {
    findRefreshTokenByHash,
    createRefreshToken,
    revokeRefreshToken,
    findUserForRefresh,
    revokeRefreshTokenFamily
} from "./refresh-token.repository.js";


const createAuthError = (
    message,
    code,
    statusCode
) => {

    const error = new Error(message);

    error.code = code;
    error.statusCode = statusCode;

    return error;
};


const refresh = async (rawRefreshToken) => {

    if (
        typeof rawRefreshToken !== "string" ||
        rawRefreshToken.trim() === ""
    ) {
        throw createAuthError(
            "Refresh token is required",
            "REFRESH_TOKEN_REQUIRED",
            401
        );
    }

    const tokenHash =
        hashRefreshToken(rawRefreshToken);

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        const existingToken =
            await findRefreshTokenByHash({
                db: client,
                tokenHash,
                forUpdate: true
            });

        if (!existingToken) {

            await client.query("ROLLBACK");

            throw createAuthError(
                "Invalid refresh token",
                "INVALID_REFRESH_TOKEN",
                401
            );
        }

        if (existingToken.revoked_at) {

            await client.query("ROLLBACK");

            const familyClient =
                await pool.connect();

            try {

                await familyClient.query("BEGIN");

                await revokeRefreshTokenFamily({
                    db: familyClient,
                    familyId: existingToken.family_id
                });

                await familyClient.query("COMMIT");

            } catch (error) {

                await familyClient.query("ROLLBACK");

                throw error;

            } finally {

                familyClient.release();

            }

            throw createAuthError(
                "Refresh token reuse detected",
                "REFRESH_TOKEN_REUSE_DETECTED",
                401
            );
        }

        const now = new Date();

        if (existingToken.expires_at <= now) {

            await client.query("ROLLBACK");

            throw createAuthError(
                "Refresh token has expired",
                "REFRESH_TOKEN_EXPIRED",
                401
            );
        }

        const user =
            await findUserForRefresh({
                db: client,
                userId: existingToken.user_id
            });

        if (!user) {

            await client.query("ROLLBACK");

            throw createAuthError(
                "User account not found",
                "USER_NOT_FOUND",
                401
            );
        }

        if (!user.is_active) {

            await client.query("ROLLBACK");

            throw createAuthError(
                "User account is inactive",
                "ACCOUNT_INACTIVE",
                403
            );
        }

        const newRefreshToken =
            generateRefreshToken();

        const newRefreshTokenHash =
            hashRefreshToken(
                newRefreshToken
            );

        const createdAt = new Date();

        const newRefreshTokenExpiresAt =
            calculateExpiration(
                createdAt,
                jwtConfig.refreshExpiresIn
            );

        const newToken =
            await createRefreshToken({
                db: client,
                userId: user.id,
                familyId: existingToken.family_id,
                tokenHash: newRefreshTokenHash,
                expiresAt: newRefreshTokenExpiresAt
            });

        const revokedToken =
            await revokeRefreshToken({
                db: client,
                tokenId: existingToken.id,
                replacedByTokenId: newToken.id
            });

        if (!revokedToken) {

            await client.query("ROLLBACK");

            throw createAuthError(
                "Refresh token rotation failed",
                "REFRESH_TOKEN_ROTATION_FAILED",
                401
            );
        }

        await client.query("COMMIT");

        const accessToken =
            generateAccessToken({
                userId: user.id,
                userType: user.role
            });

        return {
            accessToken,
            refreshToken: newRefreshToken
        };

    } catch (error) {

        if (!client._ending) {
            try {
                await client.query("ROLLBACK");
            } catch {
                // Transaction may already have been rolled back.
            }
        }

        throw error;

    } finally {

        client.release();

    }
};


export {
    refresh
};