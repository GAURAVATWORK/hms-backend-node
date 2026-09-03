import dotenv from "dotenv";

dotenv.config();

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
"JWT_PRIVATE_KEY_PATH",
"JWT_PUBLIC_KEY_PATH",
"JWT_ACCESS_EXPIRES_IN",
"JWT_REFRESH_EXPIRES_IN",
"JWT_ISSUER",
"JWT_AUDIENCE"
];

for (const variable of requiredVariables) {

    if (!process.env[variable]) {
        throw new Error(
            `Missing required environment variable: ${variable}`
        );
    }
}

const env = {
    nodeEnv: process.env.NODE_ENV,
    port: Number(process.env.PORT),

    db: {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    },

        mail: {
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT),
        user: process.env.MAIL_USER,
        password: process.env.MAIL_PASSWORD,
        from: process.env.MAIL_FROM
    },

    jwt: {
        privateKeyPath: process.env.JWT_PRIVATE_KEY_PATH,
        publicKeyPath: process.env.JWT_PUBLIC_KEY_PATH,
        accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
        issuer: process.env.JWT_ISSUER,
        audience: process.env.JWT_AUDIENCE

    },

    apiBaseUrl: process.env.API_BASE_URL



};

export default env;