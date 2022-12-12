import http from "http";
import express from "express";
import requestRouter from "./routers/requestRouter.js";
import userRouter from "./routers/userRouter.js";
import actionRouter from "./routers/actionRouter.js";
import adminRouter from "./routers/adminRouter.js";
import { FBAuth } from "./utils/authenticate.js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

const hostname = process.env.HOSTNAME || "localhost";
const port = process.env.PORT || 5000;


const configureHttpServer = async (app) => {

    app.use(express.json());
    app.use(cors())
    
    app.use("/requests", FBAuth, requestRouter);
    app.use("/users", userRouter);
    app.use("/requests/actions", FBAuth, actionRouter);
    app.use("/admin", adminRouter);
  
    return http.createServer(app);
};
  
const onGlobalErrors = (error) => {
    if (error.syscall !== "listen") {
        throw error;
    }

    var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case "EACCES":
        console.error(TAG, `${bind} requires elevated privileges`);
        process.exit(1);
        break;
        case "EADDRINUSE":
        console.error(TAG, `${bind} is already in use`);
        process.exit(1);
        break;
        default:
        throw error;
    }
};

configureHttpServer(app).then((server) => {
    server.on("error", onGlobalErrors);
    server.listen(port, hostname, () => console.log(`Server running at http://${hostname}:${port}/`));
});
