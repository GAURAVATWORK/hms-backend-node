import pool from "../../config/database.js";

const findActiveSpecialities = async ({db = pool} = {}) =>{

 const result = await db.query(`
    SELECT 
         id,
         code,
         name,
         description,
         image_key,
         is_active,
         sort_order,
         created_at,
         updated_at
    FROM specialities
    WHERE is_active = TRUE
    ORDER BY sort_order ASC, NAME ASC 
    `);

    return result.rows;
};

export {findActiveSpecialities};

