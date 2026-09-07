import {getProfile} from "./profile.service.js";

const getProfileController = async (req, res) => {

 try{
  
   const result = await getProfile({
    userId: req.user.id,
    userType: req.user.userType
   });
  
   res.statusCode = 200;
   res.setHeader(
    "Content-Type",
    "application/json"
   );

   res.end(
    JSON.stringify({
    success: true,
    data: result
    })
   );
 } catch(error){
    console.error(
        "Get profile error",
        error.message
    );

    res.setHeader(
        "Content-Type",
        "application/json"
    );

    res.end(
        JSON.stringify({
        success: false,
        error:{
            code: error.code || "INTERNAL_SERVER_ERROR",
        message: error.statusCode ? error.message : "An unexpected error occurred."    
        }
        })
    );
 }
};

export {getProfileController};