FROM node:20-slim

WORKDIR /app

COPY vulnerable-app/package*.json ./

RUN npm install

COPY vulnerable-app/ .

EXPOSE 3000

CMD ["node", "app.js"]