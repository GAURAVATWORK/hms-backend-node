const authorization = (
    ...allowedUserTypes
) => {

    return async (
        req,
        res,
        next
    ) => {

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

            error.code = "FORBIDDEN";
            error.statusCode = 403;

            throw error;
        }


        return next();
    };
};


export default authorization;