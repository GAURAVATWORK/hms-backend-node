import authentication from "../../middleware/authentication.js";
import authorizaton from "../../middleware/authorization.js";
import runMiddleware from "../../middleware/pipeline.js";
import { AUTHENTICATED_USER_ROLES,} from "../../constants/authorization.js";

import {
    getQualificationsController,
} from "./qualification.controller.js";
import User_Roles from "../../constants/roles.js";


const qualificationRoutes = async (req, res) => {

    const requestUrl = new URL(
        req.url,
        `http://${req.headers.host}`
    );


    /*
     * GET /api/v1/qualifications
     */

    if (
        req.method === "GET" &&
        requestUrl.pathname === "/api/v1/qualifications"
    ) {

        await runMiddleware(
            req,
            res,
            [
                authentication,
                authorizaton(
                    User_Roles.DOCTOR
                )
            ],
            getQualificationsController
        );

        return true;
    }


    return false;
};


export default qualificationRoutes;