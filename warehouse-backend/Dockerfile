FROM node:18-alpine AS base
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --production

# Copy source
COPY . ./

EXPOSE 3001

ENV NODE_ENV=production

CMD ["node", "index.js"]
