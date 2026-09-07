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

export {findPatientProfileByUserId};