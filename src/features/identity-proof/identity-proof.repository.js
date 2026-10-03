import pool from "../../config/database.js";


const findAllIdentityProofTypes = async() =>{
 
    const result = await pool.query(
       `SELECT
            id,
            code,
            name,
            description
          FROM identity_proof_types
          WHERE is_active = TRUE
          ORDER BY
               sort_order,
               name`
    );
    return result.rows;
};

export {
    findAllIdentityProofTypes
};