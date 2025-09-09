import { app } from "@/app";
import { AUTH_SERVICE_PORT } from "@/config";

app.listen(AUTH_SERVICE_PORT, () => {
    console.log(`Server is running on port ${AUTH_SERVICE_PORT}`);
});