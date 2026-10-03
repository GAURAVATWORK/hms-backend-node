import authentication from "../../middleware/authentication.js";
import authorizaton from "../../middleware/authorization.js";
import runMiddleware from "../../middleware/pipeline.js";

import User_Roles from "../../constants/roles.js";

import { getDoctorProfileController, registerDoctorController, updateDoctorProfileController} from "./doctor.controller.js";


const doctorRoutes = async (req, res) => {

    const requestUrl = new URL(
        req.url,
        `http://${req.headers.host}`
    );


    /*
     * POST /api/v1/doctors/registration
     */

    if (
        req.method === "POST" &&
        requestUrl.pathname === "/api/v1/doctors/registration"
    ) {

        await runMiddleware(
            req,
            res,
            [
                authentication,
                authorizaton(
                    User_Roles.DOCTOR
                ),
            ],
            registerDoctorController
        );

        return true;
    }

  if(req.method === "GET" && requestUrl.pathname === "/api/v1/doctors/profile"){
    await runMiddleware(
        req,
        res,
        [
            authentication,
            authorizaton(User_Roles.DOCTOR),
        ],
        getDoctorProfileController
    );
    return true;
  }


  /*
 * PATCH /api/v1/doctors/profile
 */

if (
    req.method === "PATCH" &&
    requestUrl.pathname === "/api/v1/doctors/profile"
) {

    await runMiddleware(
        req,
        res,
        [
            authentication,
            authorizaton(
                User_Roles.DOCTOR
            ),
        ],
        updateDoctorProfileController
    );

    return true;
}

    return false;
};


export default doctorRoutes;