// import dependencies
import express from 'express';

// import config
import { APP_CONFIG } from './config';


// initialize
const app = express();


// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// listener
let port;

if (APP_CONFIG.STATUS === "development") { port = APP_CONFIG.PORT_DEVELOPMENT; }
else if (APP_CONFIG.STATUS === "maintenance") { port = APP_CONFIG.PORT_DEVELOPMENT; }
else { port = APP_CONFIG.PORT_PRODUCTION; }

app.listen(port, () => {
    const statusMsg = APP_CONFIG.STATUS.toUpperCase();
    
    console.log(`🚀 ${APP_CONFIG.NAME} is running on http://localhost:${port} (${statusMsg})`);

    if (APP_CONFIG.STATUS === "maintenance") {
        console.warn("⚠️  CAUTION: Server is currently in maintenance mode.");
    }
});