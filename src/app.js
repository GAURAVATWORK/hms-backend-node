import http from "http";
import authRoutes from "./features/auth/auth.routes.js";
import { error } from "console";

const app = http.createServer(async(req, res) =>{
    try{
        const authRouteHandled = await authRoutes(req, res);

        if(authRouteHandled){
            return;
        }

        res.statusCode = 404;
        res.setHeader("Cotent-Type", "application/json");

        res.end(
            JSON.stringify({
                success: false,
                error: {
                    code:"ROUTE_NOT_FOUND",
                    message:"The requested endpoint was not found."
                }
            })
        );

    } catch(error){
        console.error("Unhandled request error:", error);

        res.statusCode = 500;
        res.setHeader("Conten-Type", "application/json");

        res.end(
            JSON.stringify({
                success: false,
                error: {
                    code: "INTERNET_SERVER_ERROR",
                    message:"An unexpected error occurred."
                }
            })
        )
    }
});

export default app;
