const authorization = (...allowedUserTypes) => {

    return (req, res, next) => {

        try {

            if (!req.user) {

                const error = new Error(
                    "Authentication required"
                );

                error.code =
                    "AUTHENTICATION_REQUIRED";

                error.statusCode = 401;

                throw error;
            }

            if (
                !allowedUserTypes.includes(
                    req.user.userType
                )
            ) {

                const error = new Error(
                    "You are not authorized to access this resource"
                );

                error.code =
                    "FORBIDDEN";

                error.statusCode = 403;

                throw error;
            }

            next();

        } catch (error) {

            console.error(
                "Authorization error:",
                error.message
            );

            res.statusCode =
                error.statusCode || 403;

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
                            "FORBIDDEN",
                        message:
                            error.statusCode
                                ? error.message
                                : "Access denied"
                    }
                })
            );
        }
    };
};


export default authorization;