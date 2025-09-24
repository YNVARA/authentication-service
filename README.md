# AUTH SERVICE

Authentication service built to handle user registration, login, and token management (Access & Refresh Tokens). 
This project is designed to be used as a **microservice** within a distributed system.

### Requrements

```bash
npm install -g bun
npm install -g javascript-obfuscator
npm install terser -g
```

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

# ENVIRONMENT
AUTH_SERVICE_ENV=development

# DOMAIN
AUTH_SERVICE_DOMAIN=

# JWT
AUTH_JWT_ACCESS_TOKEN_SECRET=xxx
AUTH_JWT_REFRESH_TOKEN_SECRET=xxx
```