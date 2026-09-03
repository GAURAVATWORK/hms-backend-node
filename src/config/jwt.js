import fs from "fs";
import path from "path";
import env from "./env.js";

const privateKeyPath = path.resolve(
    env.jwt.privateKeyPath
);

const publicKeyPath = path.resolve(
    env.jwt.publicKeyPath
);

const privateKey = fs.readFileSync(
    privateKeyPath,
    "utf8"
);

const publicKey = fs.readFileSync(
    publicKeyPath,
    "utf8"
);

const jwtConfig = {
    privateKey,
    publicKey,
    accessExpiresIn: env.jwt.accessExpiresIn,
    refreshExpiresIn: env.jwt.refreshExpiresIn,
    issuer: env.jwt.issuer,
    audience: env.jwt.audience
};


export default jwtConfig;