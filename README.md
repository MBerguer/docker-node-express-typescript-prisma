REST-API :: docker with Prisma + typescript + Postgres


## Customizations made
Included everything and this is ready.


### .env

You have to fill out `.env` for `docker-compose.yml`
and then fill the data on the `.env` under the prisma folder.


#### Run docker container

```shell
$ docker-compose up -d
```

#### Simple commands to run the migrations
```shell
$ npx prisma migrate save --experimental --create-db --name "init"
$ npx prisma migrate up --experimental
$ npx prisma generate
```

-------------


## To-Do
- Bundle the prisma project inside docker
- The base API methods
- Modularize each entity of the API into modules
