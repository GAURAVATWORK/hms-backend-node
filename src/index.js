import app from "./app.js";
import serverConfig from "./config/server.js";

app.listen(serverConfig.port, serverConfig.host, () =>{
  console.log(`Server running on http://localhost:${serverConfig.port}`);

});