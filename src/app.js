import http from "http";

const app = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");

    res.end(
        JSON.stringify({
            success: true,
            message: "HMS Backend Node API"
        })
    );
});

export default app;