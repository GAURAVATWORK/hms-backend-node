import runMiddleware from "../../middleware/pipeline.js";

import authentication from "../../middleware/authentication.js";

import { getSpecialities } from "./speciality.controller.js";


const specialityRoutes = async (req, res) => {

    if (
        req.method === "GET" &&
        req.url === "/api/v1/specialities"
    ) {

        await runMiddleware(
            req,
            res,
            [
                authentication
            ],
            getSpecialities
        );

        return true;
    }

    return false;
};


export default specialityRoutes;