# Etapa 1: Instalación de dependencias
FROM node:18.19.0 AS dev-deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# Etapa 2: Construcción de la aplicación
FROM node:18.19.0 AS builder
WORKDIR /app
COPY --from=dev-deps /app/node_modules ./node_modules
COPY . .
RUN npm run build --output-path=dist/erp-praxa

# Etapa 3: Imagen de producción
FROM nginx:1.23.3 AS prod
EXPOSE 80
COPY --from=builder /app/dist/erp-praxa/ /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
