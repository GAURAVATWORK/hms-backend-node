import pool from "../../config/database.js";

const findAllVerificationDocumentTypes = async () => {
const result = await pool.query(
  `SELECT 
      id,
      code,
      name,
      description
    FROM verification_document_types 
    WHERE is_active = TRUE
    ORDER BY
       sort_order,
       name`
);

return result.rows;
};

export {
  findAllVerificationDocumentTypes,  
};