import fs from "fs/promises";

import {
    findIdentityProofTypeById,
    findVerificationDocumentTypeById,
    findQualificationById,
    findExistingVerificationDocumentsByUserId,
    findUserVerificationDocuments,
    createVerificationDocuments as createVerificationDocumentsRepository,
} from "./verification-document.repository.js";

import validateFileSignature from "../../utils/file-signature.js";

import {
    copyLocalFile,
    deleteLocalFile,
} from "../../services/storage/local-storage.service.js";

import {
    createVerificationDocumentStorageKey,
} from "../../services/storage/verification-document-storage.service.js";

const MEDICAL_REGISTRATION_CERTIFICATE =
    "MEDICAL_REGISTRATION_CERTIFICATE";

const QUALIFICATION_CERTIFICATE =
    "QUALIFICATION_CERTIFICATE";

const createValidationError = (message, code) => {
    const error = new Error(message);
    error.code = code;
    error.statusCode = 400;

    return error;
};

// -------------------------------------------------------------
// Delete temporary uploaded files
// -------------------------------------------------------------

const cleanupTemporaryFiles = async (documents) => {
    await Promise.all(
        documents.map(async (document) => {
            const temporaryFilePath =
                document?.file?.tempFilePath;

            if (!temporaryFilePath) {
                return;
            }

            try {
                await fs.unlink(temporaryFilePath);
            } catch {
                // Temporary file may already have been removed.
            }
        })
    );
};

// -------------------------------------------------------------
// Delete permanently copied files
// -------------------------------------------------------------

const cleanupStoredFiles = async (storageKeys) => {
    await Promise.all(
        storageKeys.map(async (storageKey) => {
            try {
                await deleteLocalFile(storageKey);
            } catch {
                // Do not hide the original upload/database error.
            }
        })
    );
};

// -------------------------------------------------------------
// Validate verification documents
// -------------------------------------------------------------

const validateVerificationDocuments = async (
    userId,
    documents
) => {
    if (!Array.isArray(documents) || documents.length === 0) {
        throw createValidationError(
            "At least one verification document is required",
            "DOCUMENTS_REQUIRED"
        );
    }

    const existingDocuments =
        await findExistingVerificationDocumentsByUserId(
            userId
        );

    const identityProofTypeIds = new Set();

    let registrationUploadRequested = false;

    const validatedDocuments = [];

    for (const document of documents) {
        const hasIdentityProofType =
            Boolean(document.identityProofTypeId);

        const hasVerificationDocumentType =
            Boolean(document.verificationDocumentTypeId);

        const hasQualification =
            Boolean(document.qualificationId);

        // -----------------------------------------------------
        // Basic document validation
        // -----------------------------------------------------

        if (!document.file) {
            throw createValidationError(
                "Verification document file is required",
                "DOCUMENT_FILE_REQUIRED"
            );
        }

        if (
            hasIdentityProofType &&
            hasVerificationDocumentType
        ) {
            throw createValidationError(
                "A document cannot be both an identity proof and a verification document",
                "INVALID_DOCUMENT_CLASSIFICATION"
            );
        }

        if (
            !hasIdentityProofType &&
            !hasVerificationDocumentType
        ) {
            throw createValidationError(
                "Each document must have a document type",
                "DOCUMENT_TYPE_REQUIRED"
            );
        }

        if (
            hasIdentityProofType &&
            hasQualification
        ) {
            throw createValidationError(
                "Identity proof cannot have a qualification",
                "INVALID_DOCUMENT_CLASSIFICATION"
            );
        }

        if (
            !hasVerificationDocumentType &&
            hasQualification
        ) {
            throw createValidationError(
                "Qualification requires a verification document type",
                "DOCUMENT_TYPE_REQUIRED"
            );
        }

        // -----------------------------------------------------
        // Identity proof
        // -----------------------------------------------------

        if (hasIdentityProofType) {
            const identityProofType =
                await findIdentityProofTypeById(
                    document.identityProofTypeId
                );

            if (!identityProofType) {
                throw createValidationError(
                    "Invalid or inactive identity proof type",
                    "INVALID_IDENTITY_PROOF_TYPE"
                );
            }

            if (
                identityProofTypeIds.has(
                    document.identityProofTypeId
                )
            ) {
                throw createValidationError(
                    `Identity proof type '${identityProofType.code}' was uploaded more than once`,
                    "DUPLICATE_IDENTITY_PROOF_TYPE"
                );
            }

            const existingIdentityDocument =
                existingDocuments.find(
                    (existingDocument) =>
                        existingDocument.identity_proof_type_id ===
                            document.identityProofTypeId &&
                        existingDocument.verification_status !==
                            "REJECTED"
                );

            if (existingIdentityDocument) {
                throw createValidationError(
                    `An active document already exists for identity proof type '${identityProofType.code}'`,
                    "IDENTITY_PROOF_ALREADY_EXISTS"
                );
            }

            identityProofTypeIds.add(
                document.identityProofTypeId
            );

            validatedDocuments.push({
                ...document,
                verificationDocumentTypeCode: null,
            });

            continue;
        }

        // -----------------------------------------------------
        // Verification document type
        // -----------------------------------------------------

        const verificationDocumentType =
            await findVerificationDocumentTypeById(
                document.verificationDocumentTypeId
            );

        if (!verificationDocumentType) {
            throw createValidationError(
                "Invalid or inactive verification document type",
                "INVALID_VERIFICATION_DOCUMENT_TYPE"
            );
        }

        // -----------------------------------------------------
        // Medical registration certificate
        // -----------------------------------------------------

        if (
            verificationDocumentType.code ===
            MEDICAL_REGISTRATION_CERTIFICATE
        ) {
            if (hasQualification) {
                throw createValidationError(
                    "Medical registration certificate cannot have a qualification",
                    "INVALID_REGISTRATION_DOCUMENT"
                );
            }

            if (registrationUploadRequested) {
                throw createValidationError(
                    "Only one medical registration certificate can be uploaded in one request",
                    "DUPLICATE_REGISTRATION_DOCUMENT"
                );
            }

            registrationUploadRequested = true;

            validatedDocuments.push({
                ...document,
                verificationDocumentTypeCode:
                    verificationDocumentType.code,
            });

            continue;
        }

        // -----------------------------------------------------
        // Qualification certificate
        // -----------------------------------------------------

        if (
            verificationDocumentType.code ===
            QUALIFICATION_CERTIFICATE
        ) {
            if (!hasQualification) {
                throw createValidationError(
                    "Qualification certificate requires a qualification",
                    "QUALIFICATION_REQUIRED"
                );
            }

            const qualification =
                await findQualificationById(
                    document.qualificationId
                );

            if (!qualification) {
                throw createValidationError(
                    "Invalid qualification",
                    "INVALID_QUALIFICATION"
                );
            }

            validatedDocuments.push({
                ...document,
                verificationDocumentTypeCode:
                    verificationDocumentType.code,
            });

            continue;
        }

        // -----------------------------------------------------
        // Unsupported verification document type
        // -----------------------------------------------------

        throw createValidationError(
            `Unsupported verification document type: ${verificationDocumentType.code}`,
            "UNSUPPORTED_VERIFICATION_DOCUMENT_TYPE"
        );
    }

    // ---------------------------------------------------------
    // Existing medical registration certificate
    // ---------------------------------------------------------

    if (registrationUploadRequested) {
        const existingRegistration =
            existingDocuments.find(
                (document) =>
                    document.verification_document_type_code ===
                        MEDICAL_REGISTRATION_CERTIFICATE &&
                    document.verification_status !== "REJECTED"
            );

        if (existingRegistration) {
            throw createValidationError(
                "A medical registration certificate already exists and cannot be uploaded again",
                "REGISTRATION_DOCUMENT_ALREADY_EXISTS"
            );
        }
    }

    return validatedDocuments;
};

// -------------------------------------------------------------
// Create verification documents
// -------------------------------------------------------------

const createVerificationDocuments = async (
    userId,
    documents
) => {
    let validatedDocuments = [];

    const copiedStorageKeys = [];

    try {
        // -----------------------------------------------------
        // Step 1: Business validation
        // -----------------------------------------------------

        validatedDocuments = await validateVerificationDocuments(
                userId,
                documents
            );

        // -----------------------------------------------------
        // Step 2: Validate actual file signatures
        // -----------------------------------------------------

        for (const document of validatedDocuments) {
            await validateFileSignature(
                document.file.tempFilePath,
                document.file.extension
            );
        }

        // -----------------------------------------------------
        // Step 3: Generate storage keys
        // -----------------------------------------------------

        for (const document of validatedDocuments) {
            document.storageKey =
                createVerificationDocumentStorageKey(
                    userId,
                    document.file.extension
                );
        }

        // -----------------------------------------------------
        // Step 4: Copy temporary files to permanent storage
        // -----------------------------------------------------

        for (const document of validatedDocuments) {
            await copyLocalFile(
                document.file.tempFilePath,
                document.storageKey
            );

            copiedStorageKeys.push(
                document.storageKey
            );
        }

        // -----------------------------------------------------
        // Step 5: Insert database records
        // -----------------------------------------------------

        const createdDocuments = await createVerificationDocumentsRepository(
                userId,
                validatedDocuments
            );

        // -----------------------------------------------------
        // Step 6: Return created documents
        // -----------------------------------------------------

        return createdDocuments;
    } catch (error) {
        // -----------------------------------------------------
        // Database/storage failure compensation
        // -----------------------------------------------------
        //
        // PostgreSQL transaction and filesystem storage are
        // separate systems. If database insertion fails after
        // files were copied, remove those files.
        // -----------------------------------------------------

        if (copiedStorageKeys.length > 0) {
            await cleanupStoredFiles(
                copiedStorageKeys
            );
        }

        throw error;
    } finally {
        // -----------------------------------------------------
        // Step 7: Always remove temporary files
        // -----------------------------------------------------

        if (validatedDocuments.length > 0) {
            await cleanupTemporaryFiles(
                validatedDocuments
            );
        }
    }
};

// -------------------------------------------------------------
// Get user's verification documents
// -------------------------------------------------------------

const getUserVerificationDocuments = async (userId) => {
    const documents =
        await findUserVerificationDocuments(userId);

    return documents;
};

export {
    validateVerificationDocuments,
    createVerificationDocuments,
    getUserVerificationDocuments,
};