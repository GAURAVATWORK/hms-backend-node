

const MAX_VERIFICATION_DOCUMENT_SIZE_BYTES = 5 * 1024 * 1024;

const ALLOWED_VERIFICATION_DOCUMENT_MIME_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
];

const VERIFICATION_DOCUMENT_MIME_TYPES_BY_EXTENSION = {
    ".pdf": "application/pdf",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
};

export {
    MAX_VERIFICATION_DOCUMENT_SIZE_BYTES,
    ALLOWED_VERIFICATION_DOCUMENT_MIME_TYPES,
    VERIFICATION_DOCUMENT_MIME_TYPES_BY_EXTENSION,
};