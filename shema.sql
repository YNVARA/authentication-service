-- ==========================================
-- 1. PEMBERSIHAN (RESET)
-- ==========================================
DROP TABLE IF EXISTS authentication_tokens CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS user_status;

-- ==========================================
-- 2. PEMBUATAN TYPE & TABEL
-- ==========================================

-- Membuat tipe data ENUM untuk status user
CREATE TYPE user_status AS ENUM ('pending', 'active', 'suspended', 'inactive', 'deleted');

-- Membuat tabel users
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    hash_password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    status user_status DEFAULT 'pending',
    
    -- Audit kolom untuk verifikasi dan login
    email_verified_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Membuat tabel token untuk email verifikasi & reset password
CREATE TABLE authentication_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    token_type VARCHAR(50) NOT NULL, -- Contoh: 'email_verification', 'password_reset'
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_user_tokens 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE
);

-- ==========================================
-- 3. OPTIMASI (INDEXING)
-- ==========================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_auth_tokens_hash ON authentication_tokens(token_hash);