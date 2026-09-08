import authentication from "../../middleware/authentication.js";
import authorizaton from "../../middleware/authorization.js";
import runMiddleware from "../../middleware/pipeline.js";
import {AUTHENTICATED_USER_ROLES} from "../../constants/authorization.js";
import {getProfileController, updateProfileController} from "./profile.controller.js";


const profileRoutes = async (req, res) => {
 const requestUrl = new URL(
    req.url,
    `http://${req.headers.host}`
 );

  if(req.method === "GET" && requestUrl.pathname === "/api/v1/profile"){
    await runMiddleware(
        req,
        res,
        [
            authentication,
            authorizaton(
                ...AUTHENTICATED_USER_ROLES
            )
        ],
        getProfileController
    );
    return true;
  }

    /*
     * PATCH /api/v1/profile
     */

   if(req.method == "PATCH" && requestUrl.pathname === "/api/v1/profile"){
    await runMiddleware(
        req,
        res,
        [
            authentication,
            authorizaton(
                ...AUTHENTICATED_USER_ROLES
            )
        ],
            updateProfileController
    );
    return true; 
 } 

  return false;
};

export default profileRoutes;