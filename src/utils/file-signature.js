import fs from "fs/promises";

const FILE_SIGNATURES = {
    ".pdf": {
        bytes: Buffer.from("%PDF-"),
    },

    ".png": {
        bytes: Buffer.from([
            0x89,
            0x50,
            0x4e,
            0x47,
            0x0d,
            0x0a,
            0x1a,
            0x0a,
        ]),
    },

    ".jpg": {
        bytes: Buffer.from([0xff, 0xd8, 0xff]),
    },

    ".jpeg": {
        bytes: Buffer.from([0xff, 0xd8, 0xff]),
    },
};

const hasMatchingSignature = (fileBuffer, signature) => {
    if (fileBuffer.length < signature.length) {
        return false;
    }

    return signature.every(
        (byte, index) => fileBuffer[index] === byte
    );
};

const validateFileSignature = async (filePath, extension) => {
    const normalizedExtension = extension.toLowerCase();

    const signature = FILE_SIGNATURES[normalizedExtension];

    if (!signature) {
        const error = new Error(
            "Unsupported file extension for signature validation"
        );
        error.code = "UNSUPPORTED_FILE_SIGNATURE";
        error.statusCode = 400;

        throw error;
    }

    const fileHandle = await fs.open(filePath, "r");

    try {
        const buffer = Buffer.alloc(signature.bytes.length);

        await fileHandle.read(
            buffer,
            0,
            signature.bytes.length,
            0
        );

        const isValid = hasMatchingSignature(
            buffer,
            signature.bytes
        );

        if (!isValid) {
            const error = new Error(
                "File content does not match its file type"
            );
            error.code = "INVALID_FILE_SIGNATURE";
            error.statusCode = 400;

            throw error;
        }

        return true;
    } finally {
        await fileHandle.close();
    }
};

export default validateFileSignature;