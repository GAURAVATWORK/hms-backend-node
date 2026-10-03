import authentication from "../../middleware/authentication.js";
import authorizaton from "../../middleware/authorization.js";
import runMiddleware from "../../middleware/pipeline.js";
import User_Roles from "../../constants/roles.js";
import {getUserVerificationDocumentsController,} from "./verification-document.controller.js";
import {uploadVerificationDocumentsController,} from "./verification-document.controller.js";



const verificationDocumentRoutes = async (req, res) => {
    const requestUrl = new URL(
        req.url,
        `http://${req.headers.host}`
    );

    if (
        req.method === "GET" &&
        requestUrl.pathname === "/api/v1/verification-documents"
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
            getUserVerificationDocumentsController
        );

        return true;
    }

if (
    req.method === "POST" &&
    requestUrl.pathname ===
        "/api/v1/verification-documents"
) {
    await runMiddleware(
        req,
        res,
        [
            authentication,
            authorizaton(User_Roles.DOCTOR),
        ],
        uploadVerificationDocumentsController
    );

    return true;
}

    return false;
};

export default verificationDocumentRoutes;
