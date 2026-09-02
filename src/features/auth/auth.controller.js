import readJsonBody from "../../utils/read-json-body.js";
import authService from "./auth.service.js";

const signupController = async (req, res) => {

    try{
        const body = await readJsonBody(req);
    
    const result = await authService.signup(body);
    
    res.statusCode = 201;

    res.setHeader("Content-Type", "application/json");

    res.end(
        JSON.stringify({
           success: true,
           data: result,
              })
    );
  } catch (error) {
     console.error("Signup error", error.message);
     
     res.statusCode = error.statusCode || 500;
     res.setHeader("Content-Type", "application/json");

     res.end(
       JSON.stringify({
        success: false,
        error:{
            code: error.code || "INTERNAL_SERVER_ERROR",
            message: error.statusCode 
            ? error.message
            : "An unexpected error occured",
            ...(error.details && {
                details: error.details,
            }),
        },

       })
     );


    }
    };


  
const verificationEmailController = async (req, res) => {
    try {
        res.setHeader("Cache-Control", "no-store");

        const requestUrl = new URL(
            req.url,
            `http://${req.headers.host}`
        );

        const token = requestUrl.searchParams.get("token");

        await authService.verifyEmail(token);

        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");

        res.end(
            JSON.stringify({
                success: true,
                message: "Email verified successfully",
                data: {}
            })
        );

    } catch (error) {

        console.error("Email verification error:", error);

        res.statusCode = error.statusCode || 500;
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "no-store");

        res.end(
            JSON.stringify({
                success: false,
                error: {
                    code: error.code || "INTERNAL_SERVER_ERROR",
                    message: error.message || "An unexpected error occurred."
                }
            })
        );
    }
};

const resendVerificationController = async(req, res) =>{

  try {
   
    const data = await readJsonBody(req);

    const result = await authService.resendVerification(data);
    
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");

    res.end(
     JSON.stringify({
      success: true,
      data: result,
     })
    );

  } catch (error){

    console.error("Resend verification error:", error);

    res.statusCode = error.statusCode || 500;
    res.setHeader("Content-Type", "application/json");

    res.end(
     JSON.stringify({
      success: false,
      error:{
        code: error.code || "INTERNAL_SERVER_ERROR",
        message: error.statusCode ? error.message : "An unexpected error occured",
      }
     })
    );

  }

};


const loginController = async(req, res) => {

 try{
   const body = await readJsonBody(req);

   const  result = await authService.login(body);

   res.statusCode = 200;
   res.setHeader("Content-Type", "application/json");

   res.end(
    JSON.stringify({
        success: true,
        data: result,
    })
   );
} catch(error){

    console.error("Login error:", error.message);
    
    res.statusCode = error.statusCode || 500;
    res.setHeader("Content-Type", "application/json");

    res.end(
     JSON.stringify({
        success: false,
        error:{
            code: error.code || "INTERNAL_SERVER_ERROR",
            message: error.statusCode
            ? error.message
            : "An unexpected error occurred.",
            ...(error.details && {
                details: error.details,
            }),
        }
     })
    );
 }

};


const resetPasswordController = async(req, res) =>{
 try{

    const body = await readJsonBody(req);

    const result = await authService.resetPassword(body);

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");

    res.end(
        JSON.stringify({
            success: true,
            data: result,
        })
    );

 } catch (error){

    console.error("Reset password error:", error.message);

    res.statusCode = error.statusCode || 500;
    res.setHeader("Content-Type", "application/json");

    res.end(
      JSON.stringify({
        success: false,
        error: {
            code: error.code || "INTERNAL_SERVER_ERROR",
            message: error.statusCode 
                   ? error.message
                   : "An unexpected error occurred",
                   ...(error.details && {
                    details: error.details,
                   }) 
        }
      })
    );

 }
};

const forgotPasswordController = async (req, res) => {

    try {

        const body = await readJsonBody(req);

        const result = await authService.forgotPassword(body);

        res.statusCode = 200;

        res.setHeader(
            "Content-Type",
            "application/json"
        );

        res.end(
            JSON.stringify({
                success: true,
                data: result,
            })
        );

    } catch (error) {

        console.error(
            "Forgot password error:",
            error.message
        );

        res.statusCode =
            error.statusCode || 500;

        res.setHeader(
            "Content-Type",
            "application/json"
        );

        res.end(
            JSON.stringify({
                success: false,
                error: {
                    code:
                        error.code ||
                        "INTERNAL_SERVER_ERROR",

                    message:
                        error.statusCode
                            ? error.message
                            : "An unexpected error occurred.",

                    ...(error.details && {
                        details: error.details,
                    }),
                },
            })
        );
    }
};


export {
    signupController,
    verificationEmailController,
    resendVerificationController,
    loginController,
    resetPasswordController,
    forgotPasswordController,
};
