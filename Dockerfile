# Stage 1: Build the React app
FROM node:20.16.0-bullseye-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx and runtime env injection
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/default.conf

# Add the entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.d/env-inject.sh

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
