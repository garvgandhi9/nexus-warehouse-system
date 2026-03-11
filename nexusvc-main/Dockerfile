FROM node:18-alpine AS build
WORKDIR /app

# Allow build-time VITE envs
ARG VITE_API_URL
ARG VITE_MAPTILER_KEY
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_MAPTILER_KEY=${VITE_MAPTILER_KEY}

# install deps and build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:stable-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html

# SPA fallback
RUN rm /etc/nginx/conf.d/default.conf
COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
