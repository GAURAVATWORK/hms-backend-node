import readJsonBody from "../../utils/read-json-body.js";
import { refresh } from "./refresh-token.service.js";


const refreshTokenController = async (req, res) => {

    try {

        const body = await readJsonBody(req);

        const result = await refresh(
            body.refreshToken
        );

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

    } catch (error) {

        console.error(
            "Refresh token error:",
            error.message
        );

        res.statusCode =
            error.statusCode || 500;

        res.setHeader(
            "Content-Type",
            "application/json"
        );

        res.end(
            JSON.stringify({
                success: false,
                error: {
                    code:
                        error.code ||
                        "INTERNAL_SERVER_ERROR",

                    message:
                        error.statusCode
                            ? error.message
                            : "An unexpected error occurred."
                }
            })
        );
    }
};


export {
    refreshTokenController
};