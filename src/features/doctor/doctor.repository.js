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
        await client.query("BEGIN");

        // Lock and read the existing doctor profile.
        const doctorResult = await client.query(
            `
            SELECT
                user_id,
                doctor_registration_status,
                phone,
                medical_registration_number,
                medical_registration_authority,
                experience_years,
                bio,
                hospital_or_clinic_name,
                address_line_1,
                address_line_2,
                city,
                state,
                postal_code,
                country,
                offline_consultation_fee
            FROM doctors
            WHERE user_id = $1
            FOR UPDATE
            `,
            [doctorId]
        );

        if (doctorResult.rows.length === 0) {
            const error = new Error("Doctor profile was not found.");
            error.statusCode = 404;
            error.code = "DOCTOR_NOT_FOUND";
            throw error;
        }

        const existingDoctor = doctorResult.rows[0];

        // Compare nullable database values safely.
        const valuesChanged = (oldValue, newValue) => {
            if (oldValue == null && newValue == null) {
                return false;
            }

            if (oldValue == null || newValue == null) {
                return true;
            }

            return String(oldValue) !== String(newValue);
        };

        // Validate selected qualifications.
        const qualificationResult = await client.query(
            `
            SELECT id
            FROM qualifications
            WHERE id = ANY($1::uuid[])
              AND is_active = TRUE
            `,
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

        // Validate selected specialities.
        const specialityResult = await client.query(
            `
            SELECT id
            FROM specialities
            WHERE id = ANY($1::uuid[])
              AND is_active = TRUE
            `,
            [specialityIds]
        );

        if (
            specialityResult.rows.length !== specialityIds.length
        ) {
            const error = new Error(
                "One or more selected specialities are invalid or inactive."
            );
            error.statusCode = 400;
            error.code = "INVALID_SPECIALITIES";
            throw error;
        }

        // The primary speciality must be selected.
        if (!specialityIds.includes(primarySpecialityId)) {
            const error = new Error(
                "Primary speciality must be one of the selected specialities."
            );
            error.statusCode = 400;
            error.code = "INVALID_PRIMARY_SPECIALITY";
            throw error;
        }

        
        


        // Read existing qualifications and specialities before updating.
        const existingQualificationsResult = await client.query(
            `
            SELECT qualification_id
            FROM doctor_qualifications
            WHERE doctor_id = $1
            `,
            [doctorId]
        );

        const existingSpecialitiesResult = await client.query(
            `
            SELECT speciality_id, is_primary
            FROM doctor_specialities
            WHERE doctor_id = $1
            `,
            [doctorId]
        );

        const normalizeIds = (ids) =>
            ids.map(String).sort();

        const qualificationsChanged =
            JSON.stringify(
                normalizeIds(
                    existingQualificationsResult.rows.map(
                        (row) => row.qualification_id
                    )
                )
            ) !==
            JSON.stringify(normalizeIds(qualificationIds));

        const normalizeSpecialities = (items) =>
            items
                .map((item) => ({
                    id: String(item.id),
                    isPrimary: item.isPrimary,
                }))
                .sort((a, b) => a.id.localeCompare(b.id));

        const existingSpecialities = normalizeSpecialities(
            existingSpecialitiesResult.rows.map((row) => ({
                id: row.speciality_id,
                isPrimary: row.is_primary,
            }))
        );

        const submittedSpecialities = normalizeSpecialities(
            specialityIds.map((id) => ({
                id,
                isPrimary: id === primarySpecialityId,
            }))
        );

        const specialitiesChanged =
            JSON.stringify(existingSpecialities) !==
            JSON.stringify(submittedSpecialities);

        // Determine which review sections need a new review.
        const professionalDetailsChanged = [
            valuesChanged(existingDoctor.phone, phone),
            valuesChanged(
                existingDoctor.medical_registration_number,
                medicalRegistrationNumber
            ),
            valuesChanged(
                existingDoctor.medical_registration_authority,
                medicalRegistrationAuthority
            ),
            valuesChanged(
                existingDoctor.experience_years,
                experienceYears
            ),
            valuesChanged(existingDoctor.bio, bio),
            valuesChanged(
                existingDoctor.hospital_or_clinic_name,
                hospitalOrClinicName
            ),
            valuesChanged(
                existingDoctor.address_line_1,
                addressLine1
            ),
            valuesChanged(
                existingDoctor.address_line_2,
                addressLine2
            ),
            valuesChanged(existingDoctor.city, city),
            valuesChanged(existingDoctor.state, state),
            valuesChanged(existingDoctor.postal_code, postalCode),
            valuesChanged(existingDoctor.country, country),
            qualificationsChanged,
            specialitiesChanged,
        ].some(Boolean);

        const offlineFeeChanged = valuesChanged(
            existingDoctor.offline_consultation_fee,
            offlineConsultationFee
        );

        // Update doctor profile fields.
        await client.query(
            `
            UPDATE doctors
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
            WHERE user_id = $14
            `,
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

        // Replace qualification associations.
        await client.query(
            `
            DELETE FROM doctor_qualifications
            WHERE doctor_id = $1
            `,
            [doctorId]
        );

        for (const qualificationId of qualificationIds) {
            await client.query(
                `
                INSERT INTO doctor_qualifications (
                    doctor_id,
                    qualification_id
                )
                VALUES ($1, $2)
                `,
                [doctorId, qualificationId]
            );
        }

        // Replace speciality associations.
        await client.query(
            `
            DELETE FROM doctor_specialities
            WHERE doctor_id = $1
            `,
            [doctorId]
        );

        for (const specialityId of specialityIds) {
            await client.query(
                `
                INSERT INTO doctor_specialities (
                    doctor_id,
                    speciality_id,
                    is_primary
                )
                VALUES ($1, $2, $3)
                `,
                [
                    doctorId,
                    specialityId,
                    specialityId === primarySpecialityId,
                ]
            );
        }

        /*
         * Create or reset only the review sections whose
         * submitted data has changed.
         *
         * Existing review records are retained as history.
         */
        const reviewSections = [];

        if (professionalDetailsChanged) {
            reviewSections.push("PROFESSIONAL_DETAILS");
        }

        if (offlineFeeChanged) {
            reviewSections.push("OFFLINE_CONSULTATION_FEE");
        }

        for (const itemType of reviewSections) {
            await client.query(
                `
                UPDATE doctor_registration_item_reviews
                SET
                    is_current = FALSE,
                    updated_at = NOW()
                WHERE doctor_id = $1
                  AND item_type = $2
                  AND is_current = TRUE
                `,
                [doctorId, itemType]
            );

            await client.query(
                `
                INSERT INTO doctor_registration_item_reviews (
                    doctor_id,
                    item_type,
                    status,
                    is_current
                )
                VALUES ($1, $2, 'PENDING', TRUE)
                `,
                [doctorId, itemType]
            );
        }

        /*
         * On initial submission, initialize any missing review
         * sections as PENDING without resetting existing reviews.
         */
        for (const itemType of [
            "PROFESSIONAL_DETAILS",
            "OFFLINE_CONSULTATION_FEE",
        ]) {
            await client.query(
                `
                INSERT INTO doctor_registration_item_reviews (
                    doctor_id,
                    item_type,
                    status,
                    is_current
                )
                SELECT $1, $2, 'PENDING', TRUE
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM doctor_registration_item_reviews
                    WHERE doctor_id = $1
                      AND item_type = $2
                      AND is_current = TRUE
                )
                `,
                [doctorId, itemType]
            );
        }

        /*
         * A submitted or resubmitted registration awaits review.
         * Signup and email verification remain unchanged.
         */
        const updatedDoctorResult = await client.query(
            `
            UPDATE doctors
            SET
                doctor_registration_status = 'PENDING',
                updated_at = NOW()
            WHERE user_id = $1
            RETURNING
                user_id,
                doctor_number,
                name,
                doctor_registration_status
            `,
            [doctorId]
        );

        await client.query("COMMIT");

        return updatedDoctorResult.rows[0];
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



const findDoctorProfile = async (doctorId) => {

    const result = await pool.query(
        `SELECT
            d.user_id,
            d.doctor_number,
            d.profile_photo_key,
            d.name,
            u.email,
            d.date_of_birth,
            d.gender,
            d.phone,
            d.experience_years,
            d.medical_registration_number,
            d.medical_registration_authority,
            d.bio,
            d.hospital_or_clinic_name,
            d.address_line_1,
            d.address_line_2,
            d.city,
            d.state,
            d.postal_code,
            d.country,
            d.offline_consultation_fee,
            d.doctor_registration_status,
            d.created_at,
            d.updated_at,

            (
                SELECT json_agg(
                    json_build_object(
                        'qualificationId', q.id,
                        'code', q.code,
                        'name', q.name
                    )
                    ORDER BY q.sort_order, q.name
                )
                FROM doctor_qualifications dq
                INNER JOIN qualifications q
                    ON q.id = dq.qualification_id
                WHERE dq.doctor_id = d.user_id
            ) AS qualifications,

            (
                SELECT json_agg(
                    json_build_object(
                        'specialityId', s.id,
                        'code', s.code,
                        'name', s.name,
                        'isPrimary', ds.is_primary,
                        'onlineConsultationFee',
                            s.online_consultation_fee
                    )
                    ORDER BY
                        ds.is_primary DESC,
                        s.sort_order,
                        s.name
                )
                FROM doctor_specialities ds
                INNER JOIN specialities s
                    ON s.id = ds.speciality_id
                WHERE ds.doctor_id = d.user_id
            ) AS specialities,

            CASE
                WHEN dba.doctor_id IS NOT NULL THEN
                    json_build_object(
                        'accountHolderName',
                            dba.account_holder_name,
                        'accountNumber',
                            dba.account_number,
                        'ifscCode',
                            dba.ifsc_code,
                        'bankName',
                            dba.bank_name,
                        'branchName',
                            dba.branch_name
                    )
                ELSE NULL
            END AS bank_information,

            (
                SELECT json_build_object(
                    'status', pcr.status,
                    'requestedAt', pcr.created_at,
                    'requestedData', pcr.requested_data,
                    'rejectionReason', pcr.rejection_reason,
                    'reviewedAt', pcr.reviewed_at
                )
                FROM doctor_profile_change_requests pcr
                WHERE pcr.doctor_id = d.user_id
                AND pcr.change_type = 'PROFESSIONAL'
                ORDER BY pcr.created_at DESC
                LIMIT 1
            ) AS pending_professional_change,

            (
                SELECT json_build_object(
                    'status', pcr.status,
                    'requestedAt', pcr.created_at,
                    'requestedData', pcr.requested_data,
                    'rejectionReason', pcr.rejection_reason,
                    'reviewedAt', pcr.reviewed_at
                )
                FROM doctor_profile_change_requests pcr
                WHERE pcr.doctor_id = d.user_id
                AND pcr.change_type = 'OFFLINE_FEE'
                ORDER BY pcr.created_at DESC
                LIMIT 1
            ) AS pending_offline_fee_change,

            (
                SELECT json_build_object(
                    'status', pcr.status,
                    'requestedAt', pcr.created_at,
                    'requestedData', pcr.requested_data,
                    'rejectionReason', pcr.rejection_reason,
                    'reviewedAt', pcr.reviewed_at
                )
                FROM doctor_profile_change_requests pcr
                WHERE pcr.doctor_id = d.user_id
                AND pcr.change_type = 'BANK'
                ORDER BY pcr.created_at DESC
                LIMIT 1
            ) AS pending_bank_change

        FROM doctors d

        INNER JOIN users u
            ON u.id = d.user_id

        LEFT JOIN doctor_bank_accounts dba
            ON dba.doctor_id = d.user_id

        WHERE d.user_id = $1

        LIMIT 1`,
        [doctorId]
    );


    /*
     * If no Doctor profile exists,
     * return a controlled application error.
     */

    if (result.rows.length === 0) {

        const error = new Error(
            "Doctor profile was not found."
        );

        error.statusCode = 404;
        error.code = "DOCTOR_NOT_FOUND";

        throw error;
    }


    return result.rows[0];
};


const updateImmediateDoctorProfile = async (
    client,
    {
        doctorId,
        name,
        profilePhotoKey,
        dateOfBirth,
        gender,
        phone,
        bio,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country,
    }
) => {

    /*
     * Store SQL SET expressions here.
     *
     * PATCH is partial, so we only add fields that
     * were actually supplied by the Doctor.
     */
    const fields = [];


    /*
     * Store PostgreSQL parameter values here.
     *
     * Example:
     *
     * fields = ["name = $1", "phone = $2"]
     *
     * values = ["Dr. John", "9876543210"]
     */
    const values = [];


    /*
     * PostgreSQL parameter numbering starts from $1.
     */
    let parameterIndex = 1;


    /*
     * Name
     */
    if (name !== undefined) {

        fields.push(
            `name = $${parameterIndex}`
        );

        values.push(name);

        parameterIndex++;
    }


    /*
     * Profile photo
     */
    if (profilePhotoKey !== undefined) {

        fields.push(
            `profile_photo_key = $${parameterIndex}`
        );

        values.push(profilePhotoKey);

        parameterIndex++;
    }


    /*
     * Date of birth
     */
    if (dateOfBirth !== undefined) {

        fields.push(
            `date_of_birth = $${parameterIndex}`
        );

        values.push(dateOfBirth);

        parameterIndex++;
    }


    /*
     * Gender
     */
    if (gender !== undefined) {

        fields.push(
            `gender = $${parameterIndex}`
        );

        values.push(gender);

        parameterIndex++;
    }


    /*
     * Phone
     */
    if (phone !== undefined) {

        fields.push(
            `phone = $${parameterIndex}`
        );

        values.push(phone);

        parameterIndex++;
    }


    /*
     * Bio
     */
    if (bio !== undefined) {

        fields.push(
            `bio = $${parameterIndex}`
        );

        values.push(bio);

        parameterIndex++;
    }


    /*
     * Address line 1
     */
    if (addressLine1 !== undefined) {

        fields.push(
            `address_line_1 = $${parameterIndex}`
        );

        values.push(addressLine1);

        parameterIndex++;
    }


    /*
     * Address line 2
     *
     * null is allowed because addressLine2 is optional.
     */
    if (addressLine2 !== undefined) {

        fields.push(
            `address_line_2 = $${parameterIndex}`
        );

        values.push(addressLine2);

        parameterIndex++;
    }


    /*
     * City
     */
    if (city !== undefined) {

        fields.push(
            `city = $${parameterIndex}`
        );

        values.push(city);

        parameterIndex++;
    }


    /*
     * State
     */
    if (state !== undefined) {

        fields.push(
            `state = $${parameterIndex}`
        );

        values.push(state);

        parameterIndex++;
    }


    /*
     * Postal code
     */
    if (postalCode !== undefined) {

        fields.push(
            `postal_code = $${parameterIndex}`
        );

        values.push(postalCode);

        parameterIndex++;
    }


    /*
     * Country
     */
    if (country !== undefined) {

        fields.push(
            `country = $${parameterIndex}`
        );

        values.push(country);

        parameterIndex++;
    }


    /*
     * Nothing to update.
     *
     * This is not normally reached because validation
     * already requires at least one PATCH field.
     *
     * Keeping this guard makes the repository method
     * safe to call independently.
     */
    if (fields.length === 0) {
        return;
    }


    /*
     * Always update the timestamp when an immediate
     * profile field is changed.
     */
    fields.push(
        "updated_at = NOW()"
    );


    /*
     * Doctor ID becomes the final PostgreSQL parameter.
     */
    values.push(doctorId);


    /*
     * Execute the UPDATE using the transaction client
     * supplied by the service layer.
     *
     * We intentionally do NOT use pool.query() here.
     *
     * The caller owns the transaction.
     */
    await client.query(
        `UPDATE doctors
         SET
            ${fields.join(", ")}
         WHERE user_id = $${parameterIndex}`,
        values
    );
};

/*
|--------------------------------------------------------------------------
| Create / Update Doctor Profile Change Request
|--------------------------------------------------------------------------
|
| Used for changes that require Admin approval:
|
| PROFESSIONAL
| OFFLINE_FEE
| BANK
|
| The current approved Doctor data is NOT modified here.
| Only the requested change is stored.
|
|--------------------------------------------------------------------------
*/

const createProfileChangeRequest = async (
    client,
    {
        doctorId,
        changeType,
        requestedData,
    }
) => {

    /*
     * Check whether this Doctor already has a pending
     * request for the same change category.
     *
     * The database has a unique partial index:
     *
     * doctor_id + change_type
     *
     * for PENDING requests.
     *
     * Therefore a Doctor can have at most one
     * pending PROFESSIONAL request,
     * one pending OFFLINE_FEE request,
     * and one pending BANK request.
     */

const existingResult = await client.query(
    `SELECT id, requested_data
     FROM doctor_profile_change_requests
     WHERE doctor_id = $1
     AND change_type = $2
     AND status = 'PENDING'
     LIMIT 1`,
    [doctorId, changeType]
);

    /*
     * If a pending request already exists,
     * replace its requested data.
     *
     * We do NOT create another pending request.
     */

   if (existingResult.rows.length > 0) {
    const existingRequest = existingResult.rows[0];

    const mergedRequestedData = {
        ...existingRequest.requested_data,
        ...requestedData,
    };

    const updatedResult = await client.query(
        `UPDATE doctor_profile_change_requests
         SET requested_data = $1::jsonb,
             updated_at = NOW()
         WHERE id = $2
         RETURNING id, doctor_id, change_type, requested_data, status,
                   rejection_reason, reviewed_by, reviewed_at,
                   created_at, updated_at`,
        [
            JSON.stringify(mergedRequestedData),
            existingRequest.id,
        ]
    );

    return updatedResult.rows[0];
}



    /*
     * No pending request exists.
     *
     * Create a new request.
     */

    const result = await client.query(
        `INSERT INTO doctor_profile_change_requests (
            doctor_id,
            change_type,
            requested_data,
            status
         )
         VALUES (
            $1,
            $2,
            $3::jsonb,
            'PENDING'
         )
         RETURNING
            id,
            doctor_id,
            change_type,
            requested_data,
            status,
            rejection_reason,
            reviewed_by,
            reviewed_at,
            created_at,
            updated_at`,
        [
            doctorId,
            changeType,
            JSON.stringify(requestedData),
        ]
    );


    return result.rows[0];
};

/*
|--------------------------------------------------------------------------
| Find Doctor Profile Change Requests
|--------------------------------------------------------------------------
|
| Returns the latest profile change request for each
| approval category:
|
| PROFESSIONAL
| OFFLINE_FEE
| BANK
|
| We need both PENDING and REJECTED requests because
| the Doctor should be able to see the current approval
| state and rejection reason.
|
|--------------------------------------------------------------------------
*/

const findDoctorProfileChangeRequests = async (
    doctorId
) => {

    const result = await pool.query(
        `SELECT
            id,
            change_type,
            requested_data,
            status,
            rejection_reason,
            reviewed_by,
            reviewed_at,
            created_at,
            updated_at
         FROM (
            SELECT
                id,
                change_type,
                requested_data,
                status,
                rejection_reason,
                reviewed_by,
                reviewed_at,
                created_at,
                updated_at,

                ROW_NUMBER() OVER (
                    PARTITION BY change_type
                    ORDER BY created_at DESC
                ) AS row_number

            FROM doctor_profile_change_requests

            WHERE doctor_id = $1
         ) requests

         WHERE row_number = 1

         ORDER BY change_type`,
        [doctorId]
    );


    return result.rows;
};

export {
    registerDoctor,
    findDoctorProfile,
    updateImmediateDoctorProfile,
    createProfileChangeRequest,
    findDoctorProfileChangeRequests,
};