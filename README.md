# Aura Indexer

Aura Indexer is an indexing service for Cosmos-based blockchain. It crawl data from the blockchain and index it into mongoDB.

## Main flow crawl

![image](docs/images/mainflow-crawl.png)

## Architect backend api

![image](docs/images/architect-backend-api.png)

## List services

-   **api**: API Gateway services
-   **crawl-block**: get block from network and store it in redis stream
-   **handle-block**: get block from redis stream, then get transaction, evidence in block and put them to redis stream equivalent
-   **crawl-param**: get all param from network and store it in mongodb
-   **crawl-proposal**: get all proposal from network and store it in mongodb
-   **handle-transaction**: get transaction from redis stream and store it in mongodb

## How to run

```bash
# create file env
cp .env.example .env

# run with moleculer cli
npm run dev
```

## NPM scripts

-   `npm run dev`: Start development mode (load all services locally with hot-reload & REPL)
-   `npm run start`: Start production mode (set `SERVICES` env variable to load certain services)
-   `npm run cli`: Start a CLI and connect to production. Don't forget to set production namespace with `--ns` argument in script
-   `npm run lint`: Run ESLint
-   `npm run ci`: Run continuous test mode with watching
-   `npm test`: Run tests & generate coverage report
-   `npm run dc:up`: Start the stack with Docker Compose
-   `npm run dc:down`: Stop the stack with Docker Compose
