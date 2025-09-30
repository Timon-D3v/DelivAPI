FROM node:22.16.0-alpine3.20

WORKDIR /build

COPY package*.json .

RUN npm install --omit=dev
RUN npm cache clean --force

COPY dist dist

CMD ["node", "dist/app.js"]