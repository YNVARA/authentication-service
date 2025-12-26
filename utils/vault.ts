import vault from "node-vault";

const client = vault({
    apiVersion: "v1",
    endpoint: process.env.VAULT_ADDR!,
    token: process.env.VAULT_TOKEN!
});

let cache: Record<string, any> | null = null;

const loadSecrets = async () => {
    if (cache) return cache;

    const { data } = await client.read("secret/data/auth-service");
    cache = data.data;
    return cache;
};

const getSecret = async (key: string) => {
    const secrets = await loadSecrets();
    if (!secrets || !(key in secrets)) {
        throw new Error(`Secret ${key} not found in Vault`);
    }
    return secrets[key];
};

export default getSecret;
