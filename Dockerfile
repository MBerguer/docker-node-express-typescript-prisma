FROM node:latest
WORKDIR /app
COPY package.json ./app
RUN npm install
# CMD [ "npx", "ts-node", "src/index.ts" ]
CMD [ "yarn", "run", "prod" ]
