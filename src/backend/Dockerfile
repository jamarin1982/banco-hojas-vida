FROM node:20-alpine AS base

RUN apk add --no-cache poppler-utils

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

RUN mkdir -p uploads/cv

EXPOSE 4000

CMD ["npx", "tsx", "index.js"]
