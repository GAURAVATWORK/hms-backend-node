
import dotenv from "dotenv";

dotenv.config();

// Environment variables that must be provided before the application starts.
const requiredVariables = [
    "PORT",
    "DB_HOST",
    "DB_PORT",
    "DB_USER",
    "DB_PASSWORD",
    "DB_NAME",
    "MAIL_HOST",
    "MAIL_PORT",
    "MAIL_USER",
    "MAIL_PASSWORD",
    "MAIL_FROM",
    "API_BASE_URL",
    "LOCAL_STORAGE_PATH",
    "JWT_PRIVATE_KEY_PATH",
    "JWT_PUBLIC_KEY_PATH",
    "JWT_ACCESS_EXPIRES_IN",
    "JWT_REFRESH_EXPIRES_IN",
    "JWT_ISSUER",
    "JWT_AUDIENCE",
    "ADMIN_DOCTOR_CURSOR_SECRET",
];

// Fail fast if a required environment variable is missing.
for (const variable of requiredVariables) {
    if (!process.env[variable]?.trim()) {
        throw new Error(
            `Missing required environment variable: ${variable}`
        );
    }
}

// Validate numeric environment variables during application startup.
const parseIntegerEnv = (name, min = 1, max = 65535) => {
    const value = Number(process.env[name]);

    if (!Number.isInteger(value) || value < min || value > max) {
        throw new Error(
            `${name} must be an integer between ${min} and ${max}`
        );
    }

    return value;
};

// Require at least 32 bytes of hexadecimal cursor-secret material.
const adminDoctorCursorSecret = process.env.ADMIN_DOCTOR_CURSOR_SECRET;

if (!/^(?:[0-9a-fA-F]{2}){32,}$/.test(adminDoctorCursorSecret)) {
    throw new Error(
        "ADMIN_DOCTOR_CURSOR_SECRET must be a hexadecimal secret containing at least 32 bytes"
    );
}

const env = {
    nodeEnv: process.env.NODE_ENV || "development",

    port: parseIntegerEnv("PORT"),

    db: {
        host: process.env.DB_HOST,
        port: parseIntegerEnv("DB_PORT"),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    },

    mail: {
        host: process.env.MAIL_HOST,
        port: parseIntegerEnv("MAIL_PORT"),
        user: process.env.MAIL_USER,
        password: process.env.MAIL_PASSWORD,
        from: process.env.MAIL_FROM,
    },

    jwt: {
        privateKeyPath: process.env.JWT_PRIVATE_KEY_PATH,
        publicKeyPath: process.env.JWT_PUBLIC_KEY_PATH,
        accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
        issuer: process.env.JWT_ISSUER,
        audience: process.env.JWT_AUDIENCE,
    },

    apiBaseUrl: process.env.API_BASE_URL,

    localStoragePath: process.env.LOCAL_STORAGE_PATH,

    adminDoctorCursorSecret,
};

export default env;
