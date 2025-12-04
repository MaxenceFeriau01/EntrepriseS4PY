# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
RUN npm ci

# Copier le code source et builder
COPY . .
RUN npm run build

# Stage 2: Production avec Nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Supprimer les fichiers par défaut de nginx
RUN rm -rf ./*

# Copier les fichiers buildés depuis le stage précédent
COPY --from=build /app/dist .

# Copier la configuration nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port 80
EXPOSE 80

# Démarrer nginx
CMD ["nginx", "-g", "daemon off;"]