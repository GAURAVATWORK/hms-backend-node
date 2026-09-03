import pool from "../../config/database.js";

import {
    findRefreshTokenByHash,
    revokeRefreshToken
} from "./refresh-token.repository.js";

import {
    hashRefreshToken
} from "../../utils/refresh-token.js";


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


const logout = async ({
    userId,
    rawRefreshToken
}) => {

    if (
        typeof rawRefreshToken !== "string" ||
        rawRefreshToken.trim() === ""
    ) {
        throw createAuthError(
            "Refresh token is required",
            "REFRESH_TOKEN_REQUIRED",
            400
        );
    }

    const tokenHash =
        hashRefreshToken(rawRefreshToken);

    const client =
        await pool.connect();

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

        if (
            existingToken.user_id !== userId
        ) {

            await client.query("ROLLBACK");

            throw createAuthError(
                "Invalid refresh token",
                "INVALID_REFRESH_TOKEN",
                401
            );
        }

        if (existingToken.revoked_at) {

            await client.query("COMMIT");

            return {
                loggedOut: true
            };
        }

        const revokedToken =
            await revokeRefreshToken({
                db: client,
                tokenId: existingToken.id
            });

        if (!revokedToken) {

            await client.query("ROLLBACK");

            throw createAuthError(
                "Logout failed",
                "LOGOUT_FAILED",
                500
            );
        }

        await client.query("COMMIT");

        return {
            loggedOut: true
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
    logout
};
