import { loadEnvironment } from "./config/loadEnv.js";
loadEnvironment();
import app from "./app.js";
import { initializeApp } from "./config/bootstrap.js";

process.on("uncaughtException", (err) => {
    console.log(`Loi: ${err.message}`);
    console.log("May chu dang tat vi loi ngoai le");
    process.exit(1);
});

const port = process.env.PORT || 3000;
let server;

const startServer = async () => {
    try {
        await initializeApp();
        server = app.listen(port, () => {
            console.log(`Server hoat dong tren may chu: ${port}`);
        });
    } catch (err) {
        console.log(`Loi: ${err.message}`);
        process.exit(1);
    }
};

startServer();

process.on("unhandledRejection", (err) => {
    console.log(`Loi: ${err.message}`);
    console.log("May chu dang tat vi loi khong mong muon");

    if (server) {
        server.close(() => {
            process.exit(1);
        });
        return;
    }

    process.exit(1);
});
