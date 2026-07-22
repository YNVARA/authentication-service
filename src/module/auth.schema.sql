CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE SCHEMA IF NOT EXISTS auth;

-- =========================================================
-- USERS
-- =========================================================
CREATE TABLE IF NOT EXISTS auth.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
        CHECK (
            status IN (
                'ACTIVE',
                'SUSPENDED',
                'DELETED'
            )
        ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_users_status ON auth.users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON auth.users(created_at);

-- =========================================================
-- OAUTH CLIENTS
-- =========================================================
CREATE TABLE IF NOT EXISTS auth.oauth_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id VARCHAR(100) NOT NULL UNIQUE,
    client_secret TEXT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    application_type VARCHAR(20) NOT NULL
        CHECK (
            application_type IN (
                'WEB',
                'SPA',
                'NATIVE',
                'SERVICE'
            )
        ),
    client_type VARCHAR(20) NOT NULL
        CHECK (
            client_type IN (
                'PUBLIC',
                'CONFIDENTIAL'
            )
        ),
    redirect_uris JSONB,
    post_logout_redirect_uris JSONB,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_oauth_clients_client_id ON auth.oauth_clients(client_id);

-- =========================================================
-- CLIENT API KEYS
-- =========================================================
CREATE TABLE IF NOT EXISTS auth.client_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES auth.oauth_clients(id) ON DELETE CASCADE,
    key_hash TEXT NOT NULL,
    name VARCHAR(255),
    expires_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_api_keys_client ON auth.client_api_keys(client_id);

-- =========================================================
-- USER IDENTIFIERS
-- =========================================================
CREATE TABLE IF NOT EXISTS auth.user_identifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    kind VARCHAR(30) NOT NULL
        CHECK (
            kind IN (
                'EMAIL',
                'PHONE',
                'USERNAME',
                'CUSTOM'
            )
        ),
    type VARCHAR(100) NOT NULL,
    value VARCHAR(255) NOT NULL,
    normalized_value VARCHAR(255) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- IMPORTANT:
CREATE UNIQUE INDEX IF NOT EXISTS uq_user_identifiers_active ON auth.user_identifiers(kind, type, normalized_value);
CREATE INDEX IF NOT EXISTS idx_user_identifiers_user_id ON auth.user_identifiers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_identifiers_lookup ON auth.user_identifiers( kind, type, normalized_value );
CREATE INDEX IF NOT EXISTS idx_user_identifiers_normalized_value ON auth.user_identifiers(normalized_value);
CREATE INDEX IF NOT EXISTS idx_user_identifiers_kind ON auth.user_identifiers(kind);
CREATE INDEX IF NOT EXISTS idx_user_identifiers_type ON auth.user_identifiers(type);

-- =========================================================
-- PASSWORD CREDENTIALS
-- =========================================================
CREATE TABLE IF NOT EXISTS auth.password_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    password_hash TEXT NOT NULL,
    password_changed_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_password_credentials_user_id ON auth.password_credentials(user_id);

-- =========================================================
-- PASSKEYS (WEBAUTHN)
-- =========================================================
CREATE TABLE IF NOT EXISTS auth.passkeys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    credential_id BYTEA NOT NULL UNIQUE,
    public_key BYTEA NOT NULL,
    sign_count BIGINT NOT NULL DEFAULT 0,
    device_name VARCHAR(255),
    transports JSONB,
    backed_up BOOLEAN,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_passkeys_user_id ON auth.passkeys(user_id);

-- =========================================================
-- MFA METHODS
-- =========================================================
CREATE TABLE IF NOT EXISTS auth.mfa_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL
        CHECK (
            type IN (
                'TOTP',
                'SMS',
                'EMAIL'
            )
        ),
    secret TEXT,
    recovery_codes JSONB,
    verified_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_mfa_methods_active ON auth.mfa_methods(user_id, type);
CREATE INDEX IF NOT EXISTS idx_mfa_methods_user_id ON auth.mfa_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_mfa_methods_type ON auth.mfa_methods(type);

-- =========================================================
-- IDENTITY PROVIDERS
-- =========================================================
CREATE TABLE IF NOT EXISTS auth.identity_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) NOT NULL UNIQUE,
    protocol VARCHAR(30) NOT NULL
        CHECK (
            protocol IN (
                'OAUTH2',
                'OIDC',
                'SAML',
                'LDAP'
            )
        ),
    name VARCHAR(255) NOT NULL,
    config JSONB,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_identity_providers_code ON auth.identity_providers(code);
CREATE INDEX IF NOT EXISTS idx_identity_providers_protocol ON auth.identity_providers(protocol);

-- =========================================================
-- EXTERNAL IDENTITIES
-- =========================================================
CREATE TABLE IF NOT EXISTS auth.external_identities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES auth.identity_providers(id) ON DELETE CASCADE,
    external_user_id VARCHAR(255) NOT NULL,
    external_email VARCHAR(255),
    external_username VARCHAR(255),
    profile_data JSONB,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_external_identities_active
ON auth.external_identities(provider_id, external_user_id);

CREATE INDEX IF NOT EXISTS idx_external_identities_user_id ON auth.external_identities(user_id);
CREATE INDEX IF NOT EXISTS idx_external_identities_provider_id ON auth.external_identities(provider_id);

-- =========================================================
-- USER PROFILES
-- =========================================================
CREATE TABLE IF NOT EXISTS auth.user_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- AUDIT LOGS
-- =========================================================
CREATE TABLE IF NOT EXISTS auth.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON auth.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON auth.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON auth.audit_logs(created_at);

-- =========================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =========================================================
CREATE OR REPLACE FUNCTION auth.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================================================
-- UPDATED_AT TRIGGERS
-- =========================================================
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION auth.set_updated_at();

CREATE TRIGGER trg_user_identifiers_updated_at
BEFORE UPDATE ON auth.user_identifiers
FOR EACH ROW
EXECUTE FUNCTION auth.set_updated_at();

CREATE TRIGGER trg_password_credentials_updated_at
BEFORE UPDATE ON auth.password_credentials
FOR EACH ROW
EXECUTE FUNCTION auth.set_updated_at();

CREATE TRIGGER trg_passkeys_updated_at
BEFORE UPDATE ON auth.passkeys
FOR EACH ROW
EXECUTE FUNCTION auth.set_updated_at();

CREATE TRIGGER trg_mfa_methods_updated_at
BEFORE UPDATE ON auth.mfa_methods
FOR EACH ROW
EXECUTE FUNCTION auth.set_updated_at();

CREATE TRIGGER trg_identity_providers_updated_at
BEFORE UPDATE ON auth.identity_providers
FOR EACH ROW
EXECUTE FUNCTION auth.set_updated_at();

CREATE TRIGGER trg_external_identities_updated_at
BEFORE UPDATE ON auth.external_identities
FOR EACH ROW
EXECUTE FUNCTION auth.set_updated_at();

CREATE TRIGGER trg_user_profiles_updated_at
BEFORE UPDATE ON auth.user_profiles
FOR EACH ROW
EXECUTE FUNCTION auth.set_updated_at();
