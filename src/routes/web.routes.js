import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const resetPasswordPagePath = path.join(
    __dirname,
    "../../public/reset-password.html"
);

const webRoutes = async (req, res) => {

   const requestUrl = new URL(
    req.url,
    `http://${req.headers.host}`
   );

   if(req.method === "GET" && requestUrl.pathname === "/reset-password"){

    console.log("Reset password web route reached");

    try{

        const html = await fs.promises.readFile(
            resetPasswordPagePath,
            "utf-8"
        );

        console.log(
            "Reset password HTML loaded. Length:",
            html.length
        );

        res.statusCode = 200;

        res.setHeader(
            "Content-Type",
            "text/html; charset=utf-8"
        );

        res.setHeader(
            "Cache-Control",
            "no-store"
        );

        res.end(html);

    } catch(error){

        console.error(
            "Failed to load reset password page:",
            error.message
        );

        res.statusCode = 500;

        res.setHeader(
            "Content-Type",
            "text/plain; charset=utf-8"
        );

        res.end(
            "Unable to load reset password page"
        );
    }

    return true;
}

   return false;
};

export default webRoutes;