import authentication from "../../middleware/authentication.js";
import authorizaton from "../../middleware/authorization.js";
import runMiddleware from "../../middleware/pipeline.js";

import User_Roles from "../../constants/roles.js";

import { registerDoctorController,} from "./doctor.controller.js";


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


    return false;
};


export default doctorRoutes;