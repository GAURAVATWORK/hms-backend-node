import jwt from "jsonwebtoken";
import jwtConfig from "../config/jwt.js";


const generateAccessToken = ({
 userId,
 userType
}) => {
  
 const payload  = {
    sub: userId,
    userType,
    type: "access"
 }

 return jwt.sign(
    payload,
    jwtConfig.privateKey,
    {
        algorithm: "RS256",
        expiresIn: jwtConfig.accessExpiresIn,
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
    }
 );
};

const verifyAccessToken = (token) =>{
  return jwt.verify(
    token,
    jwtConfig.publicKey,
    {
        algorithms: ["RS256"],
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
    }
  );

};


export {
    generateAccessToken,
    verifyAccessToken
}


