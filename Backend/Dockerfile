FROM node:18

WORKDIR /app

COPY ./Backend .

RUN npm ci

CMD [ "npm", "run", "start" ]