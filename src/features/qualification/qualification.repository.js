import pool from "../../config/database.js";

const findActiveQualifications = async () => {
    const result = await pool.query(
        `SELECT
            id,
            code,
            name,
            description
         FROM qualifications
         WHERE is_active = TRUE
         ORDER BY sort_order ASC, name ASC`
    );

    return result.rows;
};

export {
    findActiveQualifications,
};
