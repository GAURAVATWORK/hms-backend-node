import pool from "../../config/database.js";


const registerDoctor = async ({
    doctorId,
    phone,
    medicalRegistrationNumber,
    medicalRegistrationAuthority,
    qualificationIds,
    experienceYears,
    bio,
    hospitalOrClinicName,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    country,
    offlineConsultationFee,
    specialityIds,
    primarySpecialityId,
}) => {

    const client = await pool.connect();

    try {

        /*
         * Start transaction.
         *
         * All Doctor registration changes must succeed together.
         * If any operation fails, the entire transaction is rolled back.
         */

        await client.query("BEGIN");


        /*
         * Verify that the Doctor profile exists.
         *
         * FOR UPDATE locks this Doctor row until the transaction
         * finishes.
         */

        const doctorResult = await client.query(
            `SELECT
                user_id,
                doctor_registration_status
             FROM doctors
             WHERE user_id = $1
             FOR UPDATE`,
            [doctorId]
        );


        if (doctorResult.rows.length === 0) {

            const error = new Error(
                "Doctor profile was not found."
            );

            error.statusCode = 404;
            error.code = "DOCTOR_NOT_FOUND";

            throw error;
        }


        /*
         * Validate selected qualifications against the database.
         *
         * Only active qualifications are allowed.
         */

        const qualificationResult = await client.query(
            `SELECT
                id
             FROM qualifications
             WHERE id = ANY($1::uuid[])
             AND is_active = TRUE`,
            [qualificationIds]
        );


        if (
            qualificationResult.rows.length !==
            qualificationIds.length
        ) {

            const error = new Error(
                "One or more selected qualifications are invalid or inactive."
            );

            error.statusCode = 400;
            error.code = "INVALID_QUALIFICATIONS";

            throw error;
        }


        /*
         * Validate selected specialities against the database.
         *
         * Only active specialities are allowed.
         */

        const specialityResult = await client.query(
            `SELECT
                id
             FROM specialities
             WHERE id = ANY($1::uuid[])
             AND is_active = TRUE`,
            [specialityIds]
        );


        if (
            specialityResult.rows.length !==
            specialityIds.length
        ) {

            const error = new Error(
                "One or more selected specialities are invalid or inactive."
            );

            error.statusCode = 400;
            error.code = "INVALID_SPECIALITIES";

            throw error;
        }


        /*
         * Verify that the primary speciality is one of
         * the selected specialities.
         */

        if (!specialityIds.includes(primarySpecialityId)) {

            const error = new Error(
                "Primary speciality must be one of the selected specialities."
            );

            error.statusCode = 400;
            error.code = "INVALID_PRIMARY_SPECIALITY";

            throw error;
        }


        /*
         * Update Doctor profile information.
         */

        await client.query(
            `UPDATE doctors
             SET
                phone = $1,
                medical_registration_number = $2,
                medical_registration_authority = $3,
                experience_years = $4,
                bio = $5,
                hospital_or_clinic_name = $6,
                address_line_1 = $7,
                address_line_2 = $8,
                city = $9,
                state = $10,
                postal_code = $11,
                country = $12,
                offline_consultation_fee = $13,
                updated_at = NOW()
             WHERE user_id = $14`,
            [
                phone,
                medicalRegistrationNumber,
                medicalRegistrationAuthority,
                experienceYears,
                bio,
                hospitalOrClinicName,
                addressLine1,
                addressLine2,
                city,
                state,
                postalCode,
                country,
                offlineConsultationFee,
                doctorId,
            ]
        );


        /*
         * Remove existing Doctor qualifications.
         *
         * This allows a Doctor to submit the registration again
         * with a corrected qualification selection.
         */

        await client.query(
            `DELETE FROM doctor_qualifications
             WHERE doctor_id = $1`,
            [doctorId]
        );


        /*
         * Insert the currently selected qualifications.
         */

        for (const qualificationId of qualificationIds) {

            await client.query(
                `INSERT INTO doctor_qualifications (
                    doctor_id,
                    qualification_id
                 )
                 VALUES ($1, $2)`,
                [
                    doctorId,
                    qualificationId,
                ]
            );
        }


        /*
         * Remove existing Doctor specialities.
         *
         * This also supports resubmission/correction.
         */

        await client.query(
            `DELETE FROM doctor_specialities
             WHERE doctor_id = $1`,
            [doctorId]
        );


        /*
         * Insert selected specialities.
         *
         * The selected primary speciality receives
         * is_primary = TRUE.
         */

        for (const specialityId of specialityIds) {

            await client.query(
                `INSERT INTO doctor_specialities (
                    doctor_id,
                    speciality_id,
                    is_primary
                 )
                 VALUES ($1, $2, $3)`,
                [
                    doctorId,
                    specialityId,
                    specialityId === primarySpecialityId,
                ]
            );
        }


        /*
         * Keep the Doctor registration status as PENDING.
         *
         * Submission does not mean admin verification.
         */

        const updatedDoctorResult = await client.query(
            `UPDATE doctors
             SET
                doctor_registration_status = 'PENDING',
                updated_at = NOW()
             WHERE user_id = $1
             RETURNING
                user_id,
                doctor_number,
                name,
                doctor_registration_status`,
            [doctorId]
        );


        /*
         * Commit the entire transaction.
         */

        await client.query("COMMIT");


        return updatedDoctorResult.rows[0];

    } catch (error) {

        /*
         * If anything fails, undo every database change
         * performed in this transaction.
         */

        await client.query("ROLLBACK");

        throw error;

    } finally {

        /*
         * Always release the PostgreSQL connection back
         * to the connection pool.
         */

        client.release();
    }
};


export {
    registerDoctor,
};