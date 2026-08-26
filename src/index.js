import app from "./app.js";
import serverConfig from "./config/server.js";
import initializeDatabase from "./database/init.js";

const startServer = async() => {
  try{
    await initializeDatabase();

    app.listen(
      serverConfig.port,
      serverConfig.host,
      () => {
        console.log("Server running on http://${serverConfig.host}:${serverConfig.port}");
      }
    );
  } catch(error){
    console.error("Failed to Start Server",
      error.message
    );
    process.exit(1);
  }
};

startServer();


