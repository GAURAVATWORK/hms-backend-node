import Busboy from "busboy";
import fs from "fs";
import fsPromises from "fs/promises";
import os from "os";
import path from "path";

import {
    MAX_VERIFICATION_DOCUMENT_SIZE_BYTES,
    VERIFICATION_DOCUMENT_MIME_TYPES_BY_EXTENSION,
} from "../constants/file-upload.js";

const readMultipartBody = (req) => {
    return new Promise((resolve, reject) => {
        const contentType = req.headers["content-type"];

        if (!contentType || !contentType.includes("multipart/form-data")) {
            const error = new Error(
                "Content-Type must be multipart/form-data"
            );
            error.code = "INVALID_CONTENT_TYPE";
            error.statusCode = 400;

            reject(error);
            return;
        }

        let busboy;

        try {
            busboy = Busboy({
                headers: req.headers,
                limits: {
                    fileSize: MAX_VERIFICATION_DOCUMENT_SIZE_BYTES,
                },
            });
        } catch (error) {
            error.code = "INVALID_MULTIPART_REQUEST";
            error.statusCode = 400;

            reject(error);
            return;
        }

        const fields = {};
        const files = [];
        const pendingWrites = [];

        const temporaryDirectory = fs.mkdtempSync(
            path.join(os.tmpdir(), "verification-documents-")
        );

        let hasError = false;

        const cleanupTemporaryFiles = async () => {
            await Promise.all(
                files.map(async (file) => {
                    if (!file.tempFilePath) {
                        return;
                    }

                    try {
                        await fsPromises.unlink(file.tempFilePath);
                    } catch {
                        // Ignore cleanup errors.
                    }
                })
            );

            try {
                await fsPromises.rm(temporaryDirectory, {
                    recursive: true,
                    force: true,
                });
            } catch {
                // Ignore cleanup errors.
            }
        };

        const fail = async (error) => {
            if (hasError) {
                return;
            }

            hasError = true;

            await cleanupTemporaryFiles();

            reject(error);
        };

        busboy.on("field", (fieldName, value) => {
            if (hasError) {
                return;
            }

            fields[fieldName] = value;
        });

        busboy.on("file", (fieldName, file, info) => {
            if (hasError) {
                file.resume();
                return;
            }

            const originalFileName = path.basename(info.filename || "");

            if (!originalFileName) {
                file.resume();

                const error = new Error("Uploaded file name is required");
                error.code = "FILE_NAME_REQUIRED";
                error.statusCode = 400;

                fail(error);
                return;
            }

            const extension = path
                .extname(originalFileName)
                .toLowerCase();

            const mimeType =
                VERIFICATION_DOCUMENT_MIME_TYPES_BY_EXTENSION[extension];

            if (!mimeType) {
                file.resume();

                const error = new Error(
                    "Only PDF, JPEG and PNG files are allowed"
                );
                error.code = "INVALID_FILE_TYPE";
                error.statusCode = 400;

                fail(error);
                return;
            }

            const temporaryFileName = `${Date.now()}-${Math.random()
                .toString(36)
                .slice(2)}${extension}`;

            const temporaryFilePath = path.join(
                temporaryDirectory,
                temporaryFileName
            );

            const writeStream = fs.createWriteStream(temporaryFilePath);

            let fileSize = 0;
            let fileSizeExceeded = false;

            const fileMetadata = {
                fieldName,
                originalFileName,
                extension,
                mimeType,
                size: 0,
                tempFilePath: temporaryFilePath,
            };

            files.push(fileMetadata);

            const writePromise = new Promise((resolveWrite, rejectWrite) => {
                file.on("data", (chunk) => {
                    fileSize += chunk.length;
                });

                file.on("limit", () => {
                    fileSizeExceeded = true;

                    const error = new Error(
                        "Each verification document must not exceed 5 MB"
                    );
                    error.code = "FILE_TOO_LARGE";
                    error.statusCode = 413;

                    fail(error);
                });

                file.on("end", () => {
                    fileMetadata.size = fileSize;

                    if (fileSizeExceeded || hasError) {
                        resolveWrite();
                        return;
                    }

                    resolveWrite();
                });

                file.on("error", (error) => {
                    error.code = "FILE_READ_ERROR";
                    error.statusCode = 400;

                    fail(error);
                    rejectWrite(error);
                });

                writeStream.on("error", (error) => {
                    error.code = "FILE_WRITE_ERROR";
                    error.statusCode = 500;

                    fail(error);
                    rejectWrite(error);
                });

                writeStream.on("close", () => {
                    resolveWrite();
                });

                file.pipe(writeStream);
            });

            pendingWrites.push(writePromise);
        });

        busboy.on("error", (error) => {
            error.code = "MULTIPART_PARSE_ERROR";
            error.statusCode = 400;

            fail(error);
        });

        busboy.on("finish", async () => {
            if (hasError) {
                return;
            }

            try {
                await Promise.all(pendingWrites);

                if (hasError) {
                    return;
                }

                resolve({
                    fields,
                    files,
                });
            } catch {
                if (!hasError) {
                    const error = new Error(
                        "Failed to process uploaded files"
                    );
                    error.code = "FILE_PROCESSING_ERROR";
                    error.statusCode = 500;

                    await fail(error);
                }
            }
        });

        req.pipe(busboy);
    });
};

export default readMultipartBody;