import authentication from "../../middleware/authentication.js";
import authorizaton from "../../middleware/authorization.js";
import runMiddleware from "../../middleware/pipeline.js";
import {AUTHENTICATED_USER_ROLES} from "../../constants/authorization.js";
import {getProfileController} from "./profile.controller.js";


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
  return false;
};

export default profileRoutes;