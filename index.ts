// depedency
import app from "./src/app";

// environment variables
import { APP_HOSTNAME, APP_PORT, APP_ENVIRONMENT } from "./src/config";

// start server
app.listen(APP_PORT, () => {
    console.log(`Server started at http://${APP_HOSTNAME}:${APP_PORT} in ${APP_ENVIRONMENT} mode`);
})

