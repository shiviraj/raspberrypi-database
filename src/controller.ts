import express, {Request, Response} from 'express'
import {validateCollectionName, validateDatabaseName} from "./service/validator";
import DBService, {DB, Document} from "./service/DBService";
import logger from "./logger/logger";

const controller = express.Router()

controller.use(validateDatabaseName)

controller.post("/create/database", (req: Request, res: Response): void => {
    const name = req.headers.databasename
    try {
        const dbName = DBService.createDatabase(name!.toString())
        res.send({message: `successfully created database ${dbName}`})
        logger.info({message: "Successfully created database", data: {databaseName: dbName}})
    } catch (e) {
        res.status(500).send({message: `Failed to created database`})
        logger.error({message: "Failed to create database", data: {databaseName: name}})
    }
})

controller.use(validateCollectionName)

controller.post("/create/collection", DBService.validateDatabase, (req: Request, res: Response): void => {
    const dbName = req.headers.databasename
    const collection = req.headers.collectionname
    try {
        const collectionName = DBService.createCollection(dbName!.toString(), collection!.toString())
        res.send({message: `successfully created collection ${collectionName}`})
        logger.info({message: `successfully created collection ${collectionName}`})
    } catch (e) {
        res.status(500).send({message: `Failed to created collection`})
        logger.error({message: "Failed to create collection", data: {databaseName: dbName, collectionName: collection}})
    }
})

controller.use(DBService.validateCollection)

controller.post("/insert-one", (req: Request, res: Response): void => {
    const db: DB = res.locals.db
    try {
        const payload: Document = req.body.payload
        const result = DBService.insertOne(db, payload)
        res.send(result)
        logger.info({message: "Successfully inserted data into collection", data: {db, payload}})
    } catch (e) {
        res.status(500).send({message: `Failed to insert data into collection`})
        logger.error({message: "Failed to insert data into collection", data: {db}})
    }
})

controller.post("/insert-many", (req: Request, res: Response): void => {
    const db: DB = res.locals.db
    try {
        const payloads: Array<Document> = req.body.payload;
        const data = DBService.insertMany(db, payloads)
        res.send(data)
        logger.info({message: "Successfully inserted many data into collection", data: {db, payloads}})
    } catch (e) {
        res.status(500).send({message: `Failed to insert many data into collection`})
        logger.error({message: "Failed to insert many data into collection", data: {db}})

    }
})

controller.post("/find-all", (_req: Request, res: Response): void => {
    const db: DB = res.locals.db
    res.send(db.collection)
})

export default controller