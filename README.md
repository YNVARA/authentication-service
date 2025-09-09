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

# ENVIRONMENT
AUTH_SERVICE_ENV=development

# DOMAIN
AUTH_SERVICE_DOMAIN=

# JWT
AUTH_JWT_ACCESS_TOKEN_SECRET=xxx
AUTH_JWT_REFRESH_TOKEN_SECRET=xxx
```

### Endpoint

<b>Local Register</b>

```bash
HTTP Method     : POST
Endpoint        : {x}/auth/register
Request Body    :
{
    "email"             : "",
    "password"          : "",
    "confirmPassword"   : ""
}   
```

<b>Local Login</b>

```bash
HTTP Method     : POST
Endpoint        : {x}/auth/login

Request Body    :
{
    "email"     : "",
    "password"  : "",
}   
```

<b>Refresh Token</b>

```bash
HTTP Method     : POST
Endpoint        : {x}/auth/refresh
```

<b>Logout</b>

```bash
HTTP Method     : POST
Endpoint        : {x}/auth/logout

Authorization   : Bearer {token}
```

<b>Other (Process)</b>

```bash
GET     /auth/:provider             # Redirect user to OAuth provider (Google, GitHub, etc.)
GET     /auth/:provider/callback    # Callback from provider, verify token & login/register
POST    /auth/oauth/refresh         # Refresh access token (if using JWT for OAuth users)
GET     /me                         # Get profile of logged-in user
```