import authentication from "../../middleware/authentication.js";
import authorizaton from "../../middleware/authorization.js";
import runMiddleware from "../../middleware/pipeline.js";
import { getVerificationDocumentTypesController,} from "./verification-document-type.controller.js";
import User_Roles from "../../constants/roles.js";

const verificationDocumentTypeRoutes = async (req, res) => {
    const requestUrl = new URL(
        req.url,
        `http://${req.headers.host}`
    );

    if (
        req.method === "GET" &&
        requestUrl.pathname === "/api/v1/verification-document-types"
    ) {
        await runMiddleware(
            req,
            res,
            [
                authentication,
                authorizaton(
                    User_Roles.DOCTOR,
                    User_Roles.ADMIN
            ),
            ],
            getVerificationDocumentTypesController
        );

        return true;
    }

    return false;
};

export default verificationDocumentTypeRoutes;

