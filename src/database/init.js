import pool from "../config/database.js";

const initializeDatabase = async () => {
    try {
        await pool.query("SELECT 1");
        console.log("PostgreSQL database connected successfully");

    } catch(error){
        console.error("PostgreSQL database connection failed:", error.message);
        throw error;

    }
    
};

export default initializeDatabase;