import http from "http";
import dotenv from "dotenv";
import application from "./config/express.config.js";

dotenv.config();

const port = process.env.PORT || 9005;
const host = process.env.HOST || "127.0.0.1";

const appServer = http.createServer(application); 

appServer.listen(port, host, (err) => {
  if (!err) { 
    console.log(`Server is running on port ${port}`);
    console.log("Press CTRL + C to stop the server.");
  } else {
    console.error("Server failed to start:", err);
  }
});
