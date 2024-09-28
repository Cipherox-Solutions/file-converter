FROM node:20.17.0

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN chmod +x ./scripts.sh

RUN ./scripts.sh

EXPOSE 3000

CMD ["node", "server.js"]
