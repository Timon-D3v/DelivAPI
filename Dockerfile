FROM node:24-slim

WORKDIR /delivapi

COPY package*.json ./

COPY dist dist

RUN npm ci --omit=dev

CMD ["node", "dist/app.js"]