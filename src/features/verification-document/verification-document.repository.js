import pool from "../../config/database.js";

const findUserVerificationDocuments = async (userId) => {
    const result = await pool.query(
        `
        SELECT
            uvd.id,
            uvd.document_key,
            uvd.original_file_name,
            uvd.mime_type,
            uvd.file_size_bytes,
            uvd.verification_status,
            uvd.rejection_reason,
            uvd.reviewed_by,
            uvd.reviewed_at,
            uvd.created_at,
            uvd.updated_at,

            ipt.id AS identity_proof_type_id,
            ipt.code AS identity_proof_type_code,
            ipt.name AS identity_proof_type_name,

            vdt.id AS verification_document_type_id,
            vdt.code AS verification_document_type_code,
            vdt.name AS verification_document_type_name,

            q.id AS qualification_id,
            q.code AS qualification_code,
            q.name AS qualification_name

        FROM user_verification_documents uvd

        LEFT JOIN identity_proof_types ipt
            ON ipt.id = uvd.identity_proof_type_id

        LEFT JOIN verification_document_types vdt
            ON vdt.id = uvd.verification_document_type_id

        LEFT JOIN qualifications q
            ON q.id = uvd.qualification_id

        WHERE uvd.user_id = $1

        ORDER BY uvd.created_at DESC
        `,
        [userId]
    );

    return result.rows;
};

const findIdentityProofTypeById = async (identityProofTypeId) => {
    const result = await pool.query(
        `
        SELECT
            id,
            code,
            name
        FROM identity_proof_types
        WHERE id = $1
          AND is_active = TRUE
        `,
        [identityProofTypeId]
    );

    return result.rows[0] ?? null;
};

const findVerificationDocumentTypeById = async (
    verificationDocumentTypeId
) => {
    const result = await pool.query(
        `
        SELECT
            id,
            code,
            name
        FROM verification_document_types
        WHERE id = $1
          AND is_active = TRUE
        `,
        [verificationDocumentTypeId]
    );

    return result.rows[0] ?? null;
};

const findQualificationById = async (qualificationId) => {
    const result = await pool.query(
        `
        SELECT
            id,
            code,
            name
        FROM qualifications
        WHERE id = $1
        `,
        [qualificationId]
    );

    return result.rows[0] ?? null;
};

const findExistingVerificationDocumentsByUserId = async (
    userId
) => {
    const result = await pool.query(
        `
        SELECT
            uvd.id,
            uvd.identity_proof_type_id,
            uvd.verification_document_type_id,
            uvd.qualification_id,
            uvd.verification_status,

            ipt.code AS identity_proof_type_code,

            vdt.code AS verification_document_type_code

        FROM user_verification_documents uvd

        LEFT JOIN identity_proof_types ipt
            ON ipt.id = uvd.identity_proof_type_id

        LEFT JOIN verification_document_types vdt
            ON vdt.id = uvd.verification_document_type_id

        WHERE uvd.user_id = $1
        `,
        [userId]
    );

    return result.rows;
};


const createVerificationDocuments = async (userId, documents) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        /*
         * Lock the user row to serialize document uploads
         * for the same user.
         */
        const userResult = await client.query(
            `
            SELECT id
            FROM users
            WHERE id = $1
            FOR UPDATE
            `,
            [userId]
        );

        if (userResult.rows.length === 0) {
            const error = new Error("User was not found.");
            error.statusCode = 404;
            error.code = "USER_NOT_FOUND";
            throw error;
        }

        /*
         * Load only current documents.
         *
         * Historical documents are preserved in the database,
         * but they must not block a replacement upload.
         */
        const existingDocumentsResult = await client.query(
            `
            SELECT
                uvd.id,
                uvd.identity_proof_type_id,
                uvd.verification_document_type_id,
                uvd.qualification_id,
                uvd.verification_status,
                uvd.is_current,
                ipt.code AS identity_proof_type_code,
                vdt.code AS verification_document_type_code
            FROM user_verification_documents uvd
            LEFT JOIN identity_proof_types ipt
                ON ipt.id = uvd.identity_proof_type_id
            LEFT JOIN verification_document_types vdt
                ON vdt.id = uvd.verification_document_type_id
            WHERE uvd.user_id = $1
              AND uvd.is_current = TRUE
            `,
            [userId]
        );

        const existingDocuments = existingDocumentsResult.rows;

        /*
         * Prevent duplicate identity-proof types in one request.
         */
        const requestedIdentityProofIds = new Set();

        for (const document of documents) {
            if (!document.identityProofTypeId) {
                continue;
            }

            if (
                requestedIdentityProofIds.has(
                    document.identityProofTypeId
                )
            ) {
                const error = new Error(
                    "Only one document can be uploaded for the same identity proof type in one request."
                );
                error.statusCode = 400;
                error.code = "DUPLICATE_IDENTITY_PROOF_DOCUMENT";
                throw error;
            }

            requestedIdentityProofIds.add(
                document.identityProofTypeId
            );
        }

        /*
         * Prevent multiple medical registration certificates
         * in the same request.
         */
        const registrationDocumentCount = documents.filter(
            (document) =>
                document.verificationDocumentTypeCode ===
                "MEDICAL_REGISTRATION_CERTIFICATE"
        ).length;

        if (registrationDocumentCount > 1) {
            const error = new Error(
                "Only one medical registration certificate can be uploaded in one request."
            );
            error.statusCode = 400;
            error.code = "DUPLICATE_REGISTRATION_DOCUMENT";
            throw error;
        }

        /*
         * Prevent multiple qualification certificates for
         * the same qualification in one request.
         */
        const requestedQualificationIds = new Set();

        for (const document of documents) {
            if (
                document.verificationDocumentTypeCode !==
                    "QUALIFICATION_CERTIFICATE" ||
                !document.qualificationId
            ) {
                continue;
            }

            if (
                requestedQualificationIds.has(
                    document.qualificationId
                )
            ) {
                const error = new Error(
                    "Only one qualification certificate can be uploaded for the same qualification in one request."
                );
                error.statusCode = 400;
                error.code = "DUPLICATE_QUALIFICATION_DOCUMENT";
                throw error;
            }

            requestedQualificationIds.add(
                document.qualificationId
            );
        }

        /*
         * Validate identity-proof uniqueness.
         *
         * A current VERIFIED or PENDING document cannot be
         * silently replaced. A current REJECTED document can.
         */
        for (const document of documents) {
            if (!document.identityProofTypeId) {
                continue;
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
                const error = new Error(
                    "A current document already exists for this identity proof type and has not been rejected."
                );
                error.statusCode = 409;
                error.code = "IDENTITY_PROOF_ALREADY_EXISTS";
                throw error;
            }
        }

        /*
         * Validate medical-registration certificate uniqueness.
         */
        const registrationUploadRequested = documents.some(
            (document) =>
                document.verificationDocumentTypeCode ===
                "MEDICAL_REGISTRATION_CERTIFICATE"
        );

        if (registrationUploadRequested) {
            const existingRegistration = existingDocuments.find(
                (document) =>
                    document.verification_document_type_code ===
                        "MEDICAL_REGISTRATION_CERTIFICATE" &&
                    document.verification_status !== "REJECTED"
            );

            if (existingRegistration) {
                const error = new Error(
                    "A current medical registration certificate already exists and has not been rejected."
                );
                error.statusCode = 409;
                error.code = "REGISTRATION_DOCUMENT_ALREADY_EXISTS";
                throw error;
            }
        }

        /*
         * Validate qualification-document uniqueness.
         */
        for (const document of documents) {
            if (
                document.verificationDocumentTypeCode !==
                    "QUALIFICATION_CERTIFICATE" ||
                !document.qualificationId
            ) {
                continue;
            }

            const existingQualificationDocument =
                existingDocuments.find(
                    (existingDocument) =>
                        existingDocument.verification_document_type_code ===
                            "QUALIFICATION_CERTIFICATE" &&
                        existingDocument.qualification_id ===
                            document.qualificationId &&
                        existingDocument.verification_status !==
                            "REJECTED"
                );

            if (existingQualificationDocument) {
                const error = new Error(
                    "A current qualification certificate already exists for this qualification and has not been rejected."
                );
                error.statusCode = 409;
                error.code = "QUALIFICATION_DOCUMENT_ALREADY_EXISTS";
                throw error;
            }
        }

        /*
         * Archive matching rejected documents.
         *
         * Do not delete historical records or change their
         * review status/rejection reason.
         *
         * The replacement will be inserted as PENDING below.
         */
        for (const document of documents) {
            if (document.identityProofTypeId) {
                await client.query(
                    `
                    UPDATE user_verification_documents
                    SET
                        is_current = FALSE,
                        updated_at = NOW()
                    WHERE user_id = $1
                      AND identity_proof_type_id = $2
                      AND is_current = TRUE
                      AND verification_status = 'REJECTED'
                    `,
                    [
                        userId,
                        document.identityProofTypeId,
                    ]
                );
            }

            if (
                document.verificationDocumentTypeCode ===
                "MEDICAL_REGISTRATION_CERTIFICATE"
            ) {
                await client.query(
                    `
                    UPDATE user_verification_documents
                    SET
                        is_current = FALSE,
                        updated_at = NOW()
                    WHERE user_id = $1
                      AND verification_document_type_id = (
                          SELECT id
                          FROM verification_document_types
                          WHERE code =
                              'MEDICAL_REGISTRATION_CERTIFICATE'
                      )
                      AND is_current = TRUE
                      AND verification_status = 'REJECTED'
                    `,
                    [userId]
                );
            }

            if (
                document.verificationDocumentTypeCode ===
                    "QUALIFICATION_CERTIFICATE" &&
                document.qualificationId
            ) {
                await client.query(
                    `
                    UPDATE user_verification_documents
                    SET
                        is_current = FALSE,
                        updated_at = NOW()
                    WHERE user_id = $1
                      AND verification_document_type_id = (
                          SELECT id
                          FROM verification_document_types
                          WHERE code = 'QUALIFICATION_CERTIFICATE'
                      )
                      AND qualification_id = $2
                      AND is_current = TRUE
                      AND verification_status = 'REJECTED'
                    `,
                    [
                        userId,
                        document.qualificationId,
                    ]
                );
            }
        }

        /*
         * Insert new documents.
         *
         * is_current defaults to TRUE in the migration.
         * Every new document starts with PENDING status.
         */
        for (const document of documents) {
            await client.query(
                `
                INSERT INTO user_verification_documents (
                    user_id,
                    identity_proof_type_id,
                    verification_document_type_id,
                    qualification_id,
                    document_key,
                    original_file_name,
                    mime_type,
                    file_size_bytes,
                    verification_status
                )
                VALUES (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6,
                    $7,
                    $8,
                    'PENDING'
                )
                `,
                [
                    userId,
                    document.identityProofTypeId,
                    document.verificationDocumentTypeId,
                    document.qualificationId,
                    document.storageKey,
                    document.file.originalFileName,
                    document.file.mimeType,
                    document.file.size,
                ]
            );
        }

        /*
         * Return all documents, including history.
         *
         * The frontend can use is_current to distinguish
         * the current submission from historical records.
         */
        const createdDocumentsResult = await client.query(
            `
            SELECT
                uvd.id,
                uvd.user_id,
                uvd.identity_proof_type_id,
                uvd.verification_document_type_id,
                uvd.qualification_id,
                uvd.document_key,
                uvd.original_file_name,
                uvd.mime_type,
                uvd.file_size_bytes,
                uvd.verification_status,
                uvd.rejection_reason,
                uvd.reviewed_by,
                uvd.reviewed_at,
                uvd.is_current,
                uvd.created_at,
                uvd.updated_at,

                ipt.code AS identity_proof_type_code,
                ipt.name AS identity_proof_type_name,

                vdt.code AS verification_document_type_code,
                vdt.name AS verification_document_type_name,

                q.code AS qualification_code,
                q.name AS qualification_name

            FROM user_verification_documents uvd

            LEFT JOIN identity_proof_types ipt
                ON ipt.id = uvd.identity_proof_type_id

            LEFT JOIN verification_document_types vdt
                ON vdt.id = uvd.verification_document_type_id

            LEFT JOIN qualifications q
                ON q.id = uvd.qualification_id

            WHERE uvd.user_id = $1

            ORDER BY
                uvd.created_at DESC,
                uvd.id DESC
            `,
            [userId]
        );

        await client.query("COMMIT");

        return createdDocumentsResult.rows;
    } catch (error) {
        try {
            await client.query("ROLLBACK");
        } catch {
            // Preserve the original error.
        }

        throw error;
    } finally {
        client.release();
    }
};


export {
    findUserVerificationDocuments,
    findIdentityProofTypeById,
    findVerificationDocumentTypeById,
    findQualificationById,
    findExistingVerificationDocumentsByUserId,
    createVerificationDocuments,
};