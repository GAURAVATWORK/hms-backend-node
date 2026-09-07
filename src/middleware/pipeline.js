const runMiddleware = (
    req,
    res,
    middlewares,
    controller
) => {

    let currentIndex = 0;

    const next = async () => {

        if (currentIndex < middlewares.length) {

            const currentMiddleware =
                middlewares[currentIndex];

            currentIndex++;

            await currentMiddleware(
                req,
                res,
                next
            );

            return;
        }

        await controller(req, res);
    };

    return next();
};


export default runMiddleware;