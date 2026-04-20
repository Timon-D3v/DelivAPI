FROM node:24.15.0-alpine3.23

WORKDIR /delivapi

COPY package*.json .

RUN npm install --omit=dev
RUN npm cache clean --force

COPY dist dist

CMD ["node", "dist/app.js"]