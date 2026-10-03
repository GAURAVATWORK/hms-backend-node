import authentication from "../../middleware/authentication.js";
import authorizaton from "../../middleware/authorization.js";
import runMiddleware from "../../middleware/pipeline.js";
import { getIdentityProofTypesController } from "./identity-proof.controller.js";
import { AUTHENTICATED_USER_ROLES } from "../../constants/authorization.js";

const identityProofRoutes = async (req, res) => {
    const requestUrl = new URL(
        req.url,
        `http://${req.headers.host}`
    );

    if (
        req.method === "GET" &&
        requestUrl.pathname === "/api/v1/identity-proof-types"
    ) {
        await runMiddleware(
            req,
            res,
            [
                authentication,
                authorizaton(...AUTHENTICATED_USER_ROLES),
            ],
            getIdentityProofTypesController
        );

        return true;
    }

    return false;
};

export default identityProofRoutes;