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

const createVerificationDocuments = async (
    userId,
    documents
) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        /*
         * Lock the user row.
         *
         * This serializes verification-document creation
         * requests for the same user.
         */
        await client.query(
            `
            SELECT id
            FROM users
            WHERE id = $1
            FOR UPDATE
            `,
            [userId]
        );

        /*
         * Re-check current identity documents after
         * acquiring the lock.
         */
        const existingDocumentsResult =
            await client.query(
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
                    ON vdt.id =
                        uvd.verification_document_type_id

                WHERE uvd.user_id = $1
                `,
                [userId]
            );

        const existingDocuments = existingDocumentsResult.rows;

/*
 * Prevent multiple qualification certificates
 * for the same qualification in one request.
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

    if (requestedQualificationIds.has(document.qualificationId)) {
        const error = new Error(
            "Only one qualification certificate can be uploaded for the same qualification."
        );

        error.code =
            "DUPLICATE_QUALIFICATION_DOCUMENT";

        error.statusCode = 400;

        throw error;
    }

    requestedQualificationIds.add(
        document.qualificationId
    );
}

        /*
         * Check identity-proof uniqueness again.
         *
         * REJECTED documents can be replaced.
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
                    "An active document already exists for this identity proof type"
                );

                error.code =
                    "IDENTITY_PROOF_ALREADY_EXISTS";

                error.statusCode = 409;

                throw error;
            }
        }

        /*
         * Check medical-registration uniqueness again.
         */
        const registrationUploadRequested =
            documents.some(
                (document) =>
                    document.verificationDocumentTypeCode ===
                    "MEDICAL_REGISTRATION_CERTIFICATE"
            );

        if (registrationUploadRequested) {
            const existingRegistration =
                existingDocuments.find(
                    (document) =>
                        document.verification_document_type_code ===
                            "MEDICAL_REGISTRATION_CERTIFICATE" &&
                        document.verification_status !==
                            "REJECTED"
                );

            if (existingRegistration) {
                const error = new Error(
                    "A medical registration certificate already exists"
                );

                error.code =
                    "REGISTRATION_DOCUMENT_ALREADY_EXISTS";

                error.statusCode = 409;

                throw error;
            }
        }

        /*
 * Check qualification-document uniqueness.
 *
 * Only one active qualification certificate is allowed
 * for each qualification.
 *
 * REJECTED documents can be replaced.
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
            "An active qualification certificate already exists for this qualification."
        );

        error.code =
            "QUALIFICATION_DOCUMENT_ALREADY_EXISTS";

        error.statusCode = 409;

        throw error;
    }
}

        const insertedDocumentIds = [];

        for (const document of documents) {
            const result = await client.query(
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
                RETURNING
                    id,
                    user_id,
                    identity_proof_type_id,
                    verification_document_type_id,
                    qualification_id,
                    document_key,
                    original_file_name,
                    mime_type,
                    file_size_bytes,
                    verification_status,
                    rejection_reason,
                    reviewed_by,
                    reviewed_at,
                    created_at,
                    updated_at
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

            insertedDocumentIds.push(
                result.rows[0].id
            );
        }

        const createdDocumentsResult = await client.query(
  `
  SELECT
    uvd.id,
    uvd.user_id,
    uvd.identity_proof_type_id,
    uvd.verification_document_type_id,
    uvd.qualification_id,
    uvd.document_key,
    uvd.verification_status,
    uvd.rejection_reason,
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

  ORDER BY uvd.created_at DESC
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