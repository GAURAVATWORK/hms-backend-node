import http from "http";

import authRoutes from "./features/auth/auth.routes.js";
import webRoutes from "./routes/web.routes.js";
import profileRoutes from "./features/profile/profile.routes.js";
import specialityRoutes from "./features/speciality/speciality.routes.js";

import { handleLocalStorageRequest} from "./services/storage/local-storage.handler.js";

const handleStorageRoute = async (req, res) => {

    if (
        req.method !== "GET" ||
        !req.url.startsWith("/storage/")
    ) {
        return false;
    }

    const storageKey =
        decodeURIComponent(
            req.url.substring("/storage/".length)
        );

    await handleLocalStorageRequest(
        req,
        res,
        storageKey
    );

    return true;
};


const app = http.createServer(
    async (req, res) => {

        try {

            const authRouteHandled =
                await authRoutes(req, res);

            if (authRouteHandled) {
                return;
            }


            const profileRouteHandled =
                await profileRoutes(req, res);

            if (profileRouteHandled) {
                return;
            }

            const specialityRouteHandled = await specialityRoutes(req, res);

        if (specialityRouteHandled) {
            return;
                }


            const storageRouteHandled =
                await handleStorageRoute(req, res);

            if (storageRouteHandled) {
                return;
            }


            const webRouteHandled =
                await webRoutes(req, res);

            if (webRouteHandled) {
                return;
            }


            res.statusCode = 404;

            res.setHeader(
                "Content-Type",
                "application/json"
            );

            res.end(
                JSON.stringify({
                    success: false,
                    error: {
                        code:
                            "ROUTE_NOT_FOUND",
                        message:
                            "The requested endpoint was not found."
                    }
                })
            );

        } catch (error) {

            console.error(
                "Unhandled request error:",
                error
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
    }
);


export default app;