
import authentication from "../../middleware/authentication.js";
import authorization from "../../middleware/authorization.js";
import runMiddleware from "../../middleware/pipeline.js";
import User_Roles from "../../constants/roles.js";

import {
    getAdminDoctorListController,
    getAdminDoctorDetailController,
    reviewDoctorRegistrationController,
} from "./admin.controller.js";

const adminRoutes = async (req, res) => {
    const requestUrl = new URL(
        req.url,
        `http://${req.headers.host}`
    );

    const doctorIdMatch = requestUrl.pathname.match(
        /^\/api\/v1\/admin\/doctors\/([^/]+)$/
    );

    const reviewMatch = requestUrl.pathname.match(
        /^\/api\/v1\/admin\/doctors\/([^/]+)\/review$/
    );

    const adminMiddleware = [
        authentication,
        authorization(User_Roles.ADMIN),
    ];

    if (
        req.method === "GET" &&
        requestUrl.pathname === "/api/v1/admin/doctors"
    ) {
        await runMiddleware(
            req,
            res,
            adminMiddleware,
            getAdminDoctorListController
        );

        return true;
    }

    if (req.method === "GET" && doctorIdMatch) {
        req.params = {
            ...(req.params ?? {}),
            doctorId: decodeURIComponent(doctorIdMatch[1]),
        };

        await runMiddleware(
            req,
            res,
            adminMiddleware,
            getAdminDoctorDetailController
        );

        return true;
    }

    if (req.method === "PATCH" && reviewMatch) {
        req.params = {
            ...(req.params ?? {}),
            doctorId: decodeURIComponent(reviewMatch[1]),
        };

        await runMiddleware(
            req,
            res,
            adminMiddleware,
            reviewDoctorRegistrationController
        );

        return true;
    }

    return false;
};

export default adminRoutes;
