import {resendVerificationController, signupController, verificationEmailController} from "./auth.controller.js";

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
    
    return false;

};



export default authRoutes;