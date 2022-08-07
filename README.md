# Raspberrypi database

## raspberrypi-database an alternate of mongodb, for small project / purpose using docker

MongoDB is not supported for raspberry pi. raspberrypi used linux/arm64 
os/architechure. This is developed as a nodejs project. Here will manage our database using the filesystem. All the calls made by http call.

update your `docker-compose.yml` with the following code.

```yml
version: '3.7'

volumes:
  db:
    name: db

services:
  raspberrypi-database:
    container_name: raspberrypi-database
    image: shiviraj/raspberrypi-database
    volumes:
      - db:/app/dist/db
    environment:
      - AUTH=${DATABASE_AUTH}
    ports:
      - 27017:27017
```
Either you can set the `DATABASE_AUTH` variable in env variable or replace it with an AUTH key.

### How to use
To use this database you need to make a call over the http/https with some configuration.

>POST method

Required headers for all the apis:

>**Authorization**: your DATABASE_AUTH
> 
>**databasename**: your database name
> 
>**collectionname**: your database name

### Available API

1. /create/database
2. /create/collection
3. /insert-many body:`{"paylaod": [{"data" : "value"}}]}`
4. insert-one body:`{"paylaod": {"data" : "value"}}}`
