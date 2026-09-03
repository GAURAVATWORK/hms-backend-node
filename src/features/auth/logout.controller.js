import readJsonBody from "../../utils/read-json-body.js";

import {
    logout
} from "./logout.service.js";


const logoutController = async (req, res) => {

    try {

        const body =
            await readJsonBody(req);

        const result =
            await logout({
                userId: req.user.id,
                rawRefreshToken:
                    body.refreshToken
            });

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
            "Logout error:",
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
    logoutController
};

