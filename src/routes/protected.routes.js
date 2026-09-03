import authentication from "../middleware/authentication.js";
import authorization from "../middleware/authorization.js";


const protectedRoutes = async (req, res) => {

    const requestUrl = new URL(
        req.url,
        `http://${req.headers.host}`
    );


    if (
        req.method === "GET" &&
        requestUrl.pathname === "/api/v1/protected/patient"
    ) {

        authentication(
            req,
            res,
            () => {

                authorization(
                    "PATIENT",
                    req,
                    res,
                    () => {

                        res.statusCode = 200;

                        res.setHeader(
                            "Content-Type",
                            "application/json"
                        );

                        res.end(
                            JSON.stringify({
                                success: true,
                                data: {
                                    message:
                                        "Patient authorization successful",
                                    user: req.user
                                }
                            })
                        );
                    }
                );
            }
        );

        return true;
    }


    if (
        req.method === "GET" &&
        requestUrl.pathname === "/api/v1/protected/admin"
    ) {

        authentication(
            req,
            res,
            () => {

                authorization(
                    "ADMIN",
                    req,
                    res,
                    () => {

                        res.statusCode = 200;

                        res.setHeader(
                            "Content-Type",
                            "application/json"
                        );

                        res.end(
                            JSON.stringify({
                                success: true,
                                data: {
                                    message:
                                        "Admin authorization successful",
                                    user: req.user
                                }
                            })
                        );
                    }
                );
            }
        );

        return true;
    }


    return false;
};


export default protectedRoutes;