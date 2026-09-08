import readJsonBody from "../../utils/read-json-body.js";

import { getProfile, updateProfile } from "./profile.service.js";

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



const updateProfileController = async(
    req,
    res
) => {
 try{
   const body = await readJsonBody(req);

   const result = await updateProfile({
    userId:req.user.id,
    userType:req.user.userType,
    body
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
    console.error("Update profile error:", error.message);

    res.statusCode = error.statusCode || 500;

    res.setHeader(
        "Content-Type",
        "application/json"
    );

    res.end(
        JSON.stringify({
            success: false,
            error: {
                code: error.code || "INTERNAL_SERVER_ERROR",
             message: error.statusCode ? error.message 
              : "An unexpected error occurred."
            }

        })
    );


 }
};

export {getProfileController, updateProfileController};