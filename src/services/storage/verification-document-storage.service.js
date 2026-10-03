import crypto from "crypto";
import path from "path";

const createVerificationDocumentStorageKey = (
    doctorId,
    extension
) => {
    const normalizedExtension =
        extension.toLowerCase();

    const documentId = crypto.randomUUID();

    return path
        .posix
        .join(
            "verification-documents",
            doctorId,
            `${documentId}${normalizedExtension}`
        );
};

export {
    createVerificationDocumentStorageKey,
};
