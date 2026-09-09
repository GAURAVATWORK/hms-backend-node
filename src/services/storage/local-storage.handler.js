import path from "path";

import {
    readLocalFile
} from "./local-storage.service.js";


const CONTENT_TYPES = {
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp"
};


const handleLocalStorageRequest = async (req, res, storageKey) => {
    try {
        const extension = path.extname(storageKey).toLowerCase();

        const contentType = CONTENT_TYPES[extension];

        if (!contentType) {
            res.writeHead(415, {
                "Content-Type": "application/json"
            });

            res.end(
                JSON.stringify({
                    success: false,
                    message: "Unsupported file type"
                })
            );

            return;
        }

        const file = await readLocalFile(storageKey);

        res.writeHead(200, {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=86400"
        });

        res.end(file);
    } catch (error) {
        if (error.code === "ENOENT") {
            res.writeHead(404, {
                "Content-Type": "application/json"
            });

            res.end(
                JSON.stringify({
                    success: false,
                    message: "File not found"
                })
            );

            return;
        }

        if (error.message === "Invalid storage path") {
            res.writeHead(400, {
                "Content-Type": "application/json"
            });

            res.end(
                JSON.stringify({
                    success: false,
                    message: "Invalid storage path"
                })
            );

            return;
        }

        throw error;
    }
};


export {
    handleLocalStorageRequest
};
