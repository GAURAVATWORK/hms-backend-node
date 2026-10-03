
const DOCUMENT_FIELD_PATTERN = /^documents\[(\d+)\]\[([a-zA-Z0-9]+)\]$/;

const ALLOWED_DOCUMENT_FIELDS = new Set([
    "identityProofTypeId",
    "verificationDocumentTypeId",
    "qualificationId",
    "file",
]);

const createMultipartError = (message, code) => {
    const error = new Error(message);
    error.code = code;
    error.statusCode = 400;

    return error;
};

const parseDocumentFieldName = (fieldName) => {
    const match = fieldName.match(DOCUMENT_FIELD_PATTERN);

    if (!match) {
        throw createMultipartError(
            `Invalid verification document field: ${fieldName}`,
            "INVALID_DOCUMENT_FIELD"
        );
    }

    const index = Number(match[1]);
    const field = match[2];

    if (!ALLOWED_DOCUMENT_FIELDS.has(field)) {
        throw createMultipartError(
            `Unsupported verification document field: ${field}`,
            "INVALID_DOCUMENT_FIELD"
        );
    }

    return {
        index,
        field,
    };
};

const normalizeVerificationDocuments = ({
    fields,
    files,
}) => {
    const documents = new Map();

    const getDocument = (index) => {
        if (!documents.has(index)) {
            documents.set(index, {
                identityProofTypeId: null,
                verificationDocumentTypeId: null,
                qualificationId: null,
                file: null,
            });
        }

        return documents.get(index);
    };

    for (const [fieldName, value] of Object.entries(fields)) {
        const { index, field } = parseDocumentFieldName(fieldName);

        if (field === "file") {
            throw createMultipartError(
                "File fields must contain an uploaded file",
                "INVALID_DOCUMENT_FIELD"
            );
        }

        const document = getDocument(index);

        if (document[field] !== null) {
            throw createMultipartError(
                `Duplicate field '${field}' for document ${index}`,
                "DUPLICATE_DOCUMENT_FIELD"
            );
        }

        if (typeof value !== "string" || value.trim() === "") {
            throw createMultipartError(
                `Field '${fieldName}' cannot be empty`,
                "INVALID_DOCUMENT_FIELD_VALUE"
            );
        }

        document[field] = value.trim();
    }

    for (const file of files) {
        const { index, field } = parseDocumentFieldName(
            file.fieldName
        );

        if (field !== "file") {
            throw createMultipartError(
                `Uploaded file must use documents[index][file] field`,
                "INVALID_DOCUMENT_FILE_FIELD"
            );
        }

        const document = getDocument(index);

        if (document.file !== null) {
            throw createMultipartError(
                `Multiple files are not allowed for document ${index}`,
                "DUPLICATE_DOCUMENT_FILE"
            );
        }

        document.file = file;
    }

    const normalizedDocuments = Array.from(
        documents.entries()
    )
        .sort(([firstIndex], [secondIndex]) => firstIndex - secondIndex)
        .map(([, document]) => document);

    for (const document of normalizedDocuments) {
        if (!document.file) {
            throw createMultipartError(
                "Every verification document entry must contain a file",
                "DOCUMENT_FILE_REQUIRED"
            );
        }
    }

    return normalizedDocuments;
};

export {
    normalizeVerificationDocuments,
};
