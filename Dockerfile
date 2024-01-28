# use any node version you want
FROM node:16.14.2

WORKDIR /discordBot

RUN npm update

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install

COPY . .

CMD ["node", "bot.js"]