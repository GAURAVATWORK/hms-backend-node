import dotenv from "dotenv";

dotenv.config();

const requiredVariables = [
"PORT",
"DB_HOST",
"DB_PORT",
"DB_USER",
"DB_PASSWORD",
"DB_NAME"
];

for (const variable of requiredVariables) {
    console.log(variable, process.env[variable]);

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
    }
};

export default env;