// import utils
import vault_client from "./utils/vault";

// secret for app service
export const APP_CONFIG = {
    STATUS: await vault_client("APP_STATUS"),
    NAME: await vault_client("APP_NAME"),
    PORT_DEVELOPMENT: await vault_client("APP_PORT_DEVELOPMENT"),
    PORT_PRODUCTION: await vault_client("APP_PORT_PRODUCTION"),
    VERSION: await vault_client("APP_VERSION")
}