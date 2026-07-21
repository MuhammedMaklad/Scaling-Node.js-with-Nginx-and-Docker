# Scaling Node.js with Nginx and Docker

This project demonstrates how to run multiple Node.js API containers behind an Nginx reverse proxy using Docker Compose.

Nginx listens on `localhost:80`, forwards requests to the Docker Compose service named `api` on port `3000`, and Docker can run several API replicas to show basic load balancing.

## Architecture

```text
Client / curl
  -> localhost:80
  -> Nginx proxy container
  -> api:3000
  -> one of the Node.js API containers
```

The API is a TypeScript Express app with simple diagnostic endpoints. Each response includes the container hostname, which makes it easy to see which replica handled a request.

## Project Structure

```text
.
├── docker-compose.yml
├── nginx
│   └── nginx.conf
└── node-app
    ├── Dockerfile
    ├── package.json
    ├── tsconfig.json
    └── src
        └── index.ts
```

## Prerequisites

- Docker Desktop
- Docker Compose
- Node.js, only if you want to run the app locally without Docker

## Run With Docker Compose

From the project root:

```powershell
docker compose up --build --scale api=3
```

This starts:

- 1 Nginx proxy container
- 3 Node.js API containers

Check the running containers:

```powershell
docker compose ps
```

## API Endpoints

All requests should go through Nginx on port `80`.

```powershell
curl.exe http://localhost:80/
curl.exe http://localhost:80/health
curl.exe http://localhost:80/info
```

Available routes:

- `/` returns basic runtime and host information.
- `/health` returns health status and uptime.
- `/info` returns CPU, memory, process, and Node.js details.

## Check Load Balancing

Run several requests and compare the `hostname` value in the responses:

```powershell
1..10 | ForEach-Object { curl.exe -s http://localhost:80/ }
```

If the setup is working, the `hostname` value should vary across responses because different API containers are handling requests.

## Run The Node App Locally

From the `node-app` directory:

```powershell
npm install
npm run dev
```

Build and run the compiled app:

```powershell
npm run build
npm start
```

When running locally, the app listens on port `3000` by default.

## Nginx Configuration

The proxy config is in `nginx/nginx.conf`.

```nginx
resolver 127.0.0.11 valid=10s ipv6=off;
server {
  listen 80;
  server_name localhost;

  location / {
    set $upstream api;
    proxy_pass http://$upstream:3000;
  }
}
```

Important details:

- `127.0.0.11` is Docker's internal DNS resolver.
- `api` is the Docker Compose service name.
- `proxy_pass http://$upstream:3000;` forwards requests to the Node.js API containers.

## Troubleshooting

If port `80` is already in use, change the host port in `docker-compose.yml`:

```yaml
ports:
  - "8080:80"
```

Then call:

```powershell
curl.exe http://localhost:8080/info
```

Useful debugging commands:

```powershell
docker compose ps
docker compose logs proxy
docker compose logs api
```

For local Docker Compose testing, use `--scale api=3`. The `deploy.replicas` field is mainly intended for Swarm-style deployment behavior and should not be the only scaling check during local Compose testing.

## Stop The Stack

```powershell
docker compose down
```
