import pool from "../../config/database.js";
import { findDoctorProfile,} from "../doctor/doctor.repository.js";


const PAGE_SIZE = 20;

const findDoctorList = async ({
emailVerified = null,
registrationStatus = null,
cursor = null,
}) => {
   
    const values = [];
    const conditions = ["u.role = 'DOCTOR' "];
    
    const addParameter = (value) => {
    values.push(value); 
    return `$${values.length}`;   
    };

    // Email verification filter.

    if(emailVerified !== null){
        const parameter = addParameter(emailVerified);
        conditions.push(`u.is_email_verified  = ${parameter}`);
   }

   if(registrationStatus === "NEW"){
    conditions.push("d.doctor_registration_status IS NULL");
   } else if( registrationStatus !== null){
    const parameter = addParameter(registrationStatus);

    conditions.push(
            `d.doctor_registration_status = ${parameter}`
        );
   }

   // pagination

   if(cursor !== null){
    const createdAtParameter = addParameter(cursor.createdAt);
    const userIdParameter = addParameter(cursor.userId);
    conditions.push(
     `
     (
    u.created_at < ${createdAtParameter}::timestamptz
    OR (
        u.created_at = ${createdAtParameter}::timestamptz
    AND u.id > ${userIdParameter}::uuid
                )
            )`
    );
   }


   const limitParameter = addParameter(PAGE_SIZE +1);

   const query = `
     SELECT
       u.id AS user_id,
       u.email,
       u.is_email_verified,
       u.is_active,
       COALESCE(p.name, d.name) AS name,
       d.doctor_number,
       d.doctor_registration_status,
       TO_CHAR(
       u.created_at AT TIME ZONE 'UTC',
       'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'
       ) AS cursor_created_at

       FROM users AS u
       INNER JOIN doctors AS d
          ON d.user_id = u.id
       LEFT JOIN patients AS p
          ON p.user_id = u.id
       WHERE ${conditions.join("\n AND ")}
       ORDER BY
       u.created_at DESC,
       u.id ASC
       LIMIT ${limitParameter} 
   `;

   const result = await pool.query(query,values);

   const hasMore = result.rows.length > PAGE_SIZE;

   const rows = hasMore ? result.rows.slice(0, PAGE_SIZE) : result.rows;

   const lastRow = rows.at(-1);

   return {
    rows,
    hasMore,
    nextCursorPosition: hasMore && lastRow 
                       ? {
                        createdAt: lastRow.cursor_created_at,
                        userId: lastRow.user_id,
                       } 
                       : null
   };
};

const findDoctorDetail = async (doctorId) => {
    return findDoctorProfile(doctorId);
};



const reviewDoctorRegistration = async ({
    doctorId,
    reviewedBy,
    reviews,
}) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Lock the doctor row so concurrent reviews cannot race.
        const doctorResult = await client.query(
            `
            SELECT user_id, doctor_registration_status
            FROM doctors
            WHERE user_id = $1
            FOR UPDATE
            `,
            [doctorId]
        );

        if (doctorResult.rows.length === 0) {
            const error = new Error("Doctor not found");
            error.statusCode = 404;
            error.code = "DOCTOR_NOT_FOUND";
            throw error;
        }

        const submittedRejection = reviews.some(
            (review) => review.status === "REJECTED"
        );

        for (const review of reviews) {
            let result;

            if (
                review.itemType === "IDENTITY_PROOF" ||
                review.itemType ===
                    "MEDICAL_REGISTRATION_CERTIFICATE" ||
                review.itemType === "QUALIFICATION_CERTIFICATE"
            ) {
                // Document IDs must belong to this doctor and
                // match the requested document category.
                result = await client.query(
                    `
                    UPDATE user_verification_documents AS uvd
                    SET
                        verification_status = $1,
                        rejection_reason = $2,
                        reviewed_by = $3,
                        reviewed_at = NOW(),
                        updated_at = NOW()
                    WHERE uvd.id = $4
                      AND uvd.user_id = $5
                      AND uvd.is_current = TRUE
                      AND uvd.verification_status = 'PENDING'
                      AND (
                        (
                            $6 = 'IDENTITY_PROOF'
                            AND uvd.identity_proof_type_id IS NOT NULL
                        )
                        OR (
                            $6 IN (
                                'MEDICAL_REGISTRATION_CERTIFICATE',
                                'QUALIFICATION_CERTIFICATE'
                            )
                            AND uvd.verification_document_type_id IS NOT NULL
                            AND EXISTS (
                                SELECT 1
                                FROM verification_document_types AS vdt
                                WHERE vdt.id =
                                    uvd.verification_document_type_id
                                  AND vdt.code = $6
                            )
                        )
                      )
                    RETURNING uvd.id
                    `,
                    [
                        review.status,
                        review.reason,
                        reviewedBy,
                        review.itemId,
                        doctorId,
                        review.itemType,
                    ]
                );
            } else {
                // These three item types belong to the initial
                // registration review table, not the document table.
                result = await client.query(
                    `
                    UPDATE doctor_registration_item_reviews
                    SET
                        status = $1,
                        rejection_reason = $2,
                        reviewed_by = $3,
                        reviewed_at = NOW(),
                        updated_at = NOW()
                    WHERE doctor_id = $4
                      AND item_type = $5
                      AND is_current = TRUE
                      AND status = 'PENDING'
                    RETURNING id
                    `,
                    [
                        review.status,
                        review.reason,
                        reviewedBy,
                        doctorId,
                        review.itemType,
                    ]
                );
            }

            if (result.rows.length !== 1) {
                const error = new Error(
                    `Review item not found, not pending, or does not belong to this doctor: ${review.itemType}`
                );
                error.statusCode = 409;
                error.code = "REVIEW_ITEM_NOT_REVIEWABLE";
                throw error;
            }
        }

        let registrationStatus;

        if (submittedRejection) {
            // Preserve every unsubmitted item's current status.
            registrationStatus = "REJECTED";
        } else {
            const documentSummary = await client.query(
                `
                SELECT
                    COUNT(*) AS total,
                    COUNT(*) FILTER (
                        WHERE verification_status = 'VERIFIED'
                    ) AS verified
                FROM user_verification_documents
                WHERE user_id = $1
                  AND is_current = TRUE
                `,
                [doctorId]
            );

            const sectionSummary = await client.query(
                `
                SELECT
                    COUNT(*) AS total,
                    COUNT(*) FILTER (
                        WHERE status = 'VERIFIED'
                    ) AS verified
                FROM doctor_registration_item_reviews
                WHERE doctor_id = $1
                  AND is_current = TRUE
                `,
                [doctorId]
            );

            const documents = documentSummary.rows[0];
            const sections = sectionSummary.rows[0];

            const allDocumentsVerified =
                Number(documents.total) > 0 &&
                Number(documents.total) === Number(documents.verified);

            const allSectionsVerified =
                Number(sections.total) > 0 &&
                Number(sections.total) === Number(sections.verified);

            if (!allDocumentsVerified || !allSectionsVerified) {
                const error = new Error(
                    "Registration cannot be approved until all current documents and registration review sections are verified"
                );
                error.statusCode = 409;
                error.code = "REGISTRATION_REVIEW_INCOMPLETE";
                throw error;
            }

            registrationStatus = "VERIFIED";
        }

        const updatedDoctor = await client.query(
            `
            UPDATE doctors
            SET
                doctor_registration_status = $1,
                updated_at = NOW()
            WHERE user_id = $2
            RETURNING
                user_id,
                doctor_registration_status,
                updated_at
            `,
            [registrationStatus, doctorId]
        );

        await client.query("COMMIT");

        return {
            doctorId: updatedDoctor.rows[0].user_id,
            registrationStatus:
                updatedDoctor.rows[0].doctor_registration_status,
            reviewedItems: reviews.length,
            reviewedAt: updatedDoctor.rows[0].updated_at,
        };
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



const adminRepository = {
    findDoctorList,
    findDoctorDetail,
    reviewDoctorRegistration,    
}

export default adminRepository;