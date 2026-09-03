import {
    loginController,
    resendVerificationController,
    forgotPasswordController,
    resetPasswordController,
    signupController,
    verificationEmailController
} from "./auth.controller.js";

import { refreshTokenController} from "./refresh-token.controller.js";

const authRoutes = async  (req, res) => {
    const requestUrl = new URL(
        req.url,
        `http://${req.headers.host}`
    );
   
    if(
     req.method === "POST" && requestUrl.pathname === "/api/v1/auth/signup"
    ){
       await signupController(req, res);
       return true;
    }

    if(req.method === "GET" && requestUrl.pathname === "/api/v1/auth/verify-email"){
        await verificationEmailController(req, res);
        return true;
    }

    if(req.method === "POST" && requestUrl.pathname ==="/api/v1/auth/resend-verification"){
        await resendVerificationController(req, res);
        return true;
    }


    if(req.method === "POST" && requestUrl.pathname === "/api/v1/auth/login"){
        await loginController(req, res);
        return true;
    }

    if ( req.method === "POST" && requestUrl.pathname === "/api/v1/auth/refresh"
) {
    await refreshTokenController(req, res);
    return true;
}

if (
    req.method === "POST" &&
    requestUrl.pathname === "/api/v1/auth/forgot-password"
) {

    await forgotPasswordController(req, res);

    return true;
}

    if(req.method === "POST" && requestUrl.pathname === "/api/v1/auth/reset-password"){

        await resetPasswordController(req, res);
        return true;
      
    }
    
    return false;

};




export default authRoutes;