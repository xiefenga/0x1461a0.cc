---
title: Docker Basics for Developers
created: 2025-03-22 09:15:00
updated: 2025-04-10 16:30:45
---

Docker makes it easy to run applications in isolated containers. Here's a quick intro.

## Core Concepts

| Concept    | Description                    |
| ---------- | ------------------------------ |
| Image      | Blueprint for a container      |
| Container  | Running instance of an image   |
| Dockerfile | Instructions to build an image |
| Volume     | Persistent data storage        |

## Essential Commands

```bash
# Pull an image
docker pull node:18

# Run a container
docker run -d -p 3000:3000 --name myapp node:18

# List containers
docker ps -a

# Stop and remove
docker stop myapp
docker rm myapp
```

## Writing a Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000
CMD ["npm", "start"]
```

## Build and Run

```bash
# Build image
docker build -t my-node-app .

# Run container
docker run -d -p 3000:3000 my-node-app
```

## Docker Compose

For multi-container applications:

```yaml
version: "3.8"
services:
  web:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - db
  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: secret
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

```bash
docker-compose up -d
docker-compose down
```

## Useful Tips

- Use `.dockerignore` to exclude files
- Leverage multi-stage builds for smaller images
- Use specific image tags, not `latest`
- Clean up unused resources with `docker system prune`

Docker is essential for modern development workflows!
