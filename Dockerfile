FROM node:22.14.0-alpine3.22

WORKDIR /build

COPY package*.json .

RUN npm install --omit=dev
RUN npm cache clean --force

COPY dist dist

CMD ["node", "dist/app.js"]