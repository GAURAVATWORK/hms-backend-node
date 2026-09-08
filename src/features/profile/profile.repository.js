import pool from "../../config/database.js";

const findPatientProfileByUserId = async ({
db = pool,
userId
}) => {
 
   const result = await db.query(
        `SELECT
         u.id as user_id,
         u.email,
         u.role,

         p.patient_number,
         p.profile_photo_url,
         p.name,
         p.date_of_birth,
         p.gender,
         p.phone,

         p.address_line_1,
         p.address_line_2,
         p.city,
         p.state,
         p.postal_code,
         p.country,

         p.blood_group,

         p.emergency_contact_name,
         p.emergency_contact_phone,
         p.emergency_contact_relationship

         FROM users u

         INNER JOIN patients p
            on p.user_id = u.id

         WHERE u.id = $1

         LIMIT 1 `,
         [userId]
    );


  return result.rows[0] ?? null ;

};


const updatePatientProfile = async ({
    db = pool,
    userId,
    updates
}) => {

    const fieldToColumn = {
        profilePhotoUrl: "profile_photo_url",
        name: "name",
        dateOfBirth: "date_of_birth",
        gender: "gender",
        phone: "phone",

        "address.line1": "address_line_1",
        "address.line2": "address_line_2",
        "address.city": "city",
        "address.state": "state",
        "address.postalCode": "postal_code",
        "address.country": "country",

        bloodGroup: "blood_group",

        "emergencyContact.name":
            "emergency_contact_name",

        "emergencyContact.phone":
            "emergency_contact_phone",

        "emergencyContact.relationship":
            "emergency_contact_relationship"
    };

    const setClauses = [];
    const values = [];

    let parameterIndex = 1;

    for (const [field, value] of Object.entries(updates)) {

        const column = fieldToColumn[field];

        if (!column) {
            throw new Error(
                `Unsupported profile update field: ${field}`
            );
        }

        setClauses.push(
            `${column} = $${parameterIndex}`
        );

        values.push(value);

        parameterIndex++;
    }

    setClauses.push(
        `updated_at = NOW()`
    );

    values.push(userId);

    const userIdParameter = parameterIndex;

    const result = await db.query(
        `
        UPDATE patients
        SET
            ${setClauses.join(",\n            ")}
        WHERE user_id = $${userIdParameter}
        RETURNING
            user_id,
            patient_number,
            profile_photo_url,
            name,
            date_of_birth,
            gender,
            phone,
            address_line_1,
            address_line_2,
            city,
            state,
            postal_code,
            country,
            blood_group,
            emergency_contact_name,
            emergency_contact_phone,
            emergency_contact_relationship,
            updated_at
        `,
        values
    );

    return result.rows[0] ?? null;
};





export {
   findPatientProfileByUserId,
   updatePatientProfile

};