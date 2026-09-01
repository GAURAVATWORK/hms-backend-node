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
            ...authService(error.details && {
                details: error.details,
            }),
        },

       })
     );


    }
    };



// const verificationEmailController = async(req, res) =>{
//   try{
  
//     const requestUrl = new URL(
//         req.url,
//         `http://${req.headers.host}`
//     );

//     const token = requestUrl.searchParams.get("token");

//     const result = await authService.verifyEmail(token);

//     res.statusCode = 200;
//     res.setHeader("Content-Type", "application/json");

//     res.end(
//       JSON.stringify({
//         success: true,
//         message:"Email verified Successfully",
//         data: result, 
//       })
//     ); 

//   } catch(error){

//     console.error("Email verification eror:", error);

//     res.statusCode = error.statusCode || 500;

//     res.setHeader("Content-Type", "applicaiton/json");

//     res.end(
//      JSON.stringify({
//      success: false,
//      error:{
//         code: error.code || "INTERNAL_SERVER_ERROR",
//         message: error.message || "An unexpected error occured.",
//      },
//      })

//     );
//   }
// }; 

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

    const result = authService.resendVerification(data);
    
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");

    res.end(
     JSON.stringify({
      success: true,
      data: result,
     })
    );

  } catch (error){

    console.error("REsend verification error:", eror);

    res.statusCode = eror.statusCode || 500;
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


export {
    signupController,
    verificationEmailController,
    resendVerificationController,
};
