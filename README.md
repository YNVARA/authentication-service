# AUTH SERVICE

A lightweight authentication service built with Node.js, PostgreSQL, and Redis. Handles user registration, login, password management, and email verification.

---

## Repository

```bash
git clone https://github.com/Styxian-Legion/auth-service.git
cd auth-service
```

## Local Development

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Edit .env to configure your local environment:

```env
# App Configuration
APP_NAME=
APP_VERSION=0.0.1
APP_HOST=
APP_PORT=
APP_ENVIRONMENT=development
APP_DOMAIN=

# Database Configuration
PG_DB_HOST=localhost
PG_DB_PORT=
PG_DB_USER=
PG_DB_PASS=
PG_DB_NAME=
PG_MAX_CONNECTION=10
PG_IDLE_TIMEOUT=10000
PG_CONNECTION_TIMEOUT=5000

# JWT Configuration
JWT_ACCESS_TOKEN_SECRET=your_access_secret
JWT_REFRESH_TOKEN_SECRET=your_refresh_secret
JWT_ISSUER=auth.myapp.com
JWT_AUDIENCE=myapp-users

# Redis Configuration
REDIS_HOST=
REDIS_PORT=
REDIS_PASS=
```

3. Install dependencies and start the server:

```bash
bun install
bun run dev
```

4. Open [http://localhost:4000](http://localhost:4000)

## Running with Docker

Run the service in a Docker container:

```bash
docker build -t auth-service:0.0.1 -t auth-service:latest .
```

```bash
# login ke docker hub
docker login

# Tag untuk versi 0.0.1
docker tag auth-service:0.0.1 <username-docker-hub>/auth-service:0.0.1

# Tag untuk versi latest
docker tag auth-service:latest <username-docker-hub>/auth-service:latest

# Push versi spesifik
docker push <username-docker-hub>/auth-service:0.0.1

# Push sebagai latest
docker push <username-docker-hub>/auth-service:latest
```

```bash
docker run -d \
  --name auth-service-app \
  -p 4000:4000 \
  --add-host=host.docker.internal:host-gateway \
  -e APP_NAME=auth-service \
  -e APP_VERSION=0.0.1 \
  -e APP_HOST=0.0.0.0 \
  -e APP_PORT=4000 \
  -e APP_ENVIRONMENT=development \
  -e APP_DOMAIN=http://localhost:4000 \
  -e PG_DB_HOST=host.docker.internal \
  -e PG_DB_PORT=5432 \
  -e PG_DB_USER=postgres \
  -e PG_DB_PASS=postgres \
  -e PG_DB_NAME=auth_service \
  -e PG_MAX_CONNECTION=10 \
  -e PG_IDLE_TIMEOUT=10000 \
  -e PG_CONNECTION_TIMEOUT=5000 \
  -e JWT_ACCESS_TOKEN_SECRET=super-secret \
  -e JWT_REFRESH_TOKEN_SECRET=super-secret \
  -e JWT_ISSUER=auth.myapp.com \
  -e JWT_AUDIENCE=myapp-users \
  -e REDIS_HOST=host.docker.internal \
  -e REDIS_PORT=6379 \
  -e REDIS_PASS=root \
  auth-service:latest
```

## Notes

- Make sure PostgreSQL and Redis are running locally or accessible from Docker.
- Keep JWT secrets secure and never commit them to the repository.
- This service is intended to be used behind an API Gateway in a microservices architecture.