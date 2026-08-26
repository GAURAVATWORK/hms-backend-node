import pg, { Query } from "pg";
import env from "../src/config/env.js";

const {Client} = pg;

const client = new Client({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: "postgres",
});

const createDatabse = async() => {
    try {
     await client.connect();
     
     console.log("connected to PostgreSQL server");

     const result = await client.query(
              "SELECT 1 FROM pg_database WHERE datname = $1",
              [env.db.database]
     );

     if(result.rowCount === 0){
        await client.query(`CREATE DATABASE "${env.db.database}"`);
      console.log(`Database "${env.db.database}" created successfully`);
     } else {
      console.log(`Database "${env.db.database}" already exists`);
     } 
    } catch(error) {

    console.error("Database creation failed:", error.message);

    process.exitCode = 1;

    } finally{
        await client.end();
    }
}

createDatabse();
