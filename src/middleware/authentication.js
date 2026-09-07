import { verifyAccessToken } from "../utils/jwt.js";


const authentication = async (
    req,
    res,
    next
) => {

    const authorizationHeader =
        req.headers.authorization;

    if (!authorizationHeader) {

        const error = new Error(
            "Authentication required"
        );

        error.code = "AUTHENTICATION_REQUIRED";
        error.statusCode = 401;

        throw error;
    }


    const [scheme, token] =
        authorizationHeader.split(" ");


    if (
        scheme !== "Bearer" ||
        !token
    ) {

        const error = new Error(
            "Invalid authorization header"
        );

        error.code =
            "INVALID_AUTHORIZATION_HEADER";

        error.statusCode = 401;

        throw error;
    }


    const payload =
        verifyAccessToken(token);


    if (
        !payload.sub ||
        !payload.userType ||
        payload.type !== "access"
    ) {

        const error = new Error(
            "Invalid access token"
        );

        error.code =
            "INVALID_ACCESS_TOKEN";

        error.statusCode = 401;

        throw error;
    }


    req.user = {
        id: payload.sub,
        userType: payload.userType
    };


    return next();
};


export default authentication;