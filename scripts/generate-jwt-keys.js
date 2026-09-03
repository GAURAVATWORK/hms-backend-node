import {generateKeyPairSync} from "crypto";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import path from "path";

const keyDirectory = path.resolve("keys");

const privateKeyPath = path.join(
    keyDirectory,
    "access-token-private.pem"
);

const publicKeyPath = path.join(
    keyDirectory,
    "access-token-public.pem"
);

if(existsSync(privateKeyPath) || existsSync(publicKeyPath)){
    throw new Error(
                "JWT keys already exist. Delete the existing keys before generating new ones."

    );
}

mkdirSync(keyDirectory,{
    recursive:true
}
);

const {privateKey, publicKey} = generateKeyPairSync(
  "rsa",
  {
    modulusLength: 4096,
    publicKeyEncoding:{
        type: "spki",
        format: "pem"
    },
   
    privateKeyEncoding: {
        type: "pkcs8",
        format: "pem"
    }
  }
);

writeFileSync(privateKeyPath, privateKey);

writeFileSync(publicKeyPath, publicKey);

console.log(
    "JWT RSA key pair generated succssfully."
);

console.log(`private key: ${privateKeyPath}`);

console.log(`Public key: ${publicKeyPath}`);


