-- ==========================================
-- 1. TYPE: user_status (SAFE)
-- ==========================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
        CREATE TYPE user_status AS ENUM ('pending', 'active', 'suspended', 'inactive', 'deleted');
    END IF;
END$$;

-- ==========================================
-- 2. TABLE: users
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='public_id') THEN
        ALTER TABLE users ADD COLUMN public_id VARCHAR(32) NOT NULL UNIQUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='email') THEN
        ALTER TABLE users ADD COLUMN email VARCHAR(255) NOT NULL UNIQUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='username') THEN
        ALTER TABLE users ADD COLUMN username VARCHAR(100) NOT NULL UNIQUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='hash_password') THEN
        ALTER TABLE users ADD COLUMN hash_password VARCHAR(255) NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='status') THEN
        ALTER TABLE users ADD COLUMN status user_status DEFAULT 'pending';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='email_verified_at') THEN
        ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='last_login_at') THEN
        ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='created_at') THEN
        ALTER TABLE users ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='updated_at') THEN
        ALTER TABLE users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='deleted_at') THEN
        ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
    END IF;
END$$;

-- ==========================================
-- 3. TABLE: authentication_tokens
-- ==========================================
CREATE TABLE IF NOT EXISTS authentication_tokens (
    id BIGSERIAL PRIMARY KEY
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='authentication_tokens' AND column_name='public_id') THEN
        ALTER TABLE authentication_tokens ADD COLUMN public_id VARCHAR(32) NOT NULL UNIQUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='authentication_tokens' AND column_name='user_id') THEN
        ALTER TABLE authentication_tokens ADD COLUMN user_id BIGINT NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='authentication_tokens' AND column_name='token_hash') THEN
        ALTER TABLE authentication_tokens ADD COLUMN token_hash VARCHAR(255) NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='authentication_tokens' AND column_name='token_type') THEN
        ALTER TABLE authentication_tokens ADD COLUMN token_type VARCHAR(50) NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='authentication_tokens' AND column_name='expires_at') THEN
        ALTER TABLE authentication_tokens ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='authentication_tokens' AND column_name='used_at') THEN
        ALTER TABLE authentication_tokens ADD COLUMN used_at TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='authentication_tokens' AND column_name='created_at') THEN
        ALTER TABLE authentication_tokens ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;
END$$;

-- ==========================================
-- 4. FOREIGN KEY (SAFE)
-- ==========================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_user_tokens'
    ) THEN
        ALTER TABLE authentication_tokens
        ADD CONSTRAINT fk_user_tokens
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE;
    END IF;
END$$;

-- ==========================================
-- 5. INDEXING (SAFE)
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_users_public_id ON users(public_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

CREATE INDEX IF NOT EXISTS idx_auth_tokens_public_id ON authentication_tokens(public_id);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_hash ON authentication_tokens(token_hash);
