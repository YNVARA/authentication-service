# AUTH SERVICE

Authentication service built to handle user registration, login, and token management (Access & Refresh Tokens). 
This project is designed to be used as a **microservice** within a distributed system.

### Getting Started

```bash
git clone https://github.com/Styxian-Legion/auth-service.git
cd auth-service
```

```bash
bun install     # install package dependencies
bun run dev     # running project on development
bun run build   # prepare project before production
bun run start   # running project on production
```

### Environment

```
# SERVER
AUTH_SERVICE_PORT=xxx

# DATABASE
AUTH_SERVICE_DB=postgres://username:password@localhost:5432/db_name

# JWT
AUTH_JWT_ACCESS_TOKEN_SECRET=xxx
AUTH_JWT_REFRESH_TOKEN_SECRET=xxx
```

### Endpoint

```bash
# =======================================
# OAuth Authentication (Google, GitHub, etc.)
# =======================================

GET     /auth/:provider             # Redirect user to OAuth provider (Google, GitHub, etc.)
GET     /auth/:provider/callback    # Callback from provider, verify token & login/register
POST    /auth/oauth/refresh         # Refresh access token (if using JWT for OAuth users)

# =======================================
# Local Authentication (Email + Password)
# =======================================
POST    /auth/register              # Register a new user
POST    /auth/login                 # Login & get tokens (JWT)
POST    /auth/refresh               # Refresh access token
POST    /auth/logout                # Revoke / logout user

GET     /me                         # Get profile of logged-in user
```