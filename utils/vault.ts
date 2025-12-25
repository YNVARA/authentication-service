// import dependencies
import vault from "node-vault";


// initialize
const config = vault({
    apiVersion: "v1",
    endpoint: "http://localhost:8200",
    token: "root"
})


// get secret
const vault_client = async (secret_name: string) => {
    try {
        const response = await config.read("secret/data/auth-service");
        const { data } = response.data;

        return data[secret_name];
    } catch (error: any) {
        console.error("Vault Error:", error.message);
        return null;
    }
};


// export
export default vault_client