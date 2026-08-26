import pool from "../src/config/database.js";

const runTransactionDemo = async () => {
    const client = await pool.connect();

    try {
        console.log("Starting transaction...");

        await client.query("BEGIN");

        console.log("Transaction started.");

        const insertResult = await client.query(
            `
            INSERT INTO users (
                email,
                password_hash
            )
            VALUES ($1, $2)
            RETURNING id, email
            `,
            [
                `transaction-demo-${Date.now()}@example.com`,
                "demo-password-hash"
            ]
        );

        const user = insertResult.rows[0];

        console.log("User created:", user);

        await client.query(
            `
            UPDATE users
            SET is_email_verified = TRUE
            WHERE id = $1
            `,
            [user.id]
        );

        console.log("User updated.");

        await client.query("COMMIT");

        console.log("Transaction committed successfully.");
    } catch (error) {
        console.error("Transaction failed:", error.message);

        await client.query("ROLLBACK");

        console.log("Transaction rolled back.");
    } finally {
        client.release();

        console.log("Database client released.");

        await pool.end();

        console.log("Database pool closed.");
    }
};

runTransactionDemo();