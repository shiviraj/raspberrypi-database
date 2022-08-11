import express, {Request, Response} from 'express'
import {validateCollectionName, validateDatabaseName} from "./service/validator";
import DBService, {DB, Document} from "./service/DBService";
import logger from "./logger/logger";
import {DuplicateKeyError} from "./error/DuplicateKeyError";

const controller = express.Router()

controller.use(validateDatabaseName)

controller.post("/database", (req: Request, res: Response): void => {
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

controller.delete("/database", (req: Request, res: Response): void => {
    const name = req.headers.databasename
    try {
        const dbName = DBService.deleteDatabase(name!.toString())
        res.send({message: `successfully deleted database ${dbName}`})
        logger.info({message: "Successfully deleted database", data: {databaseName: dbName}})
    } catch (e) {
        res.status(500).send({message: `Failed to deleted database`})
        logger.error({message: "Failed to delete database", data: {databaseName: name}})
    }
})

controller.use(validateCollectionName)

controller.post("/collection", DBService.validateDatabase, (req: Request, res: Response): void => {
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

controller.delete("/collection", DBService.validateDatabase, (req: Request, res: Response): void => {
    const dbName = req.headers.databasename
    const collection = req.headers.collectionname
    try {
        const collectionName = DBService.deleteCollection(dbName!.toString(), collection!.toString())
        res.send({message: `successfully deleted collection ${collectionName}`})
        logger.info({message: `successfully deleted collection ${collectionName}`})
    } catch (e) {
        res.status(500).send({message: `Failed to deleted collection`})
        logger.error({message: "Failed to delete collection", data: {databaseName: dbName, collectionName: collection}})
    }
})

controller.use(DBService.validateCollection)

controller.post("/insert-one", (req: Request, res: Response): void => {
    try {
        const db: DB = res.locals.db
        const payload: Document = req.body.payload
        res.send(DBService.insertOne(db, payload))
        logger.info({message: "Successfully inserted data into collection"})
    } catch (e) {
        if (e instanceof DuplicateKeyError) {
            res.status(409).send({message: e.message})
            return logger.error({message: e.message})
        }
        res.status(500).send({message: `Failed to insert data into collection`})
        logger.error({message: "Failed to insert data into collection"})
    }
})

controller.post("/insert-many", (req: Request, res: Response): void => {
    try {
        const payloads: Array<Document> = req.body.payload;
        const db: DB = res.locals.db
        res.send(DBService.insertMany(db, payloads))
        logger.info({message: "Successfully inserted many data into collection"})
    } catch (e) {
        if (e instanceof DuplicateKeyError) {
            res.status(409).send({message: e.message})
            return logger.error({message: e.message})
        }
        res.status(500).send({message: `Failed to insert many data into collection`})
        logger.error({message: "Failed to insert many data into collection"})

    }
})

controller.post("/find", (req: Request, res: Response): void => {
    try {
        const db: DB = res.locals.db
        const query: Document = req.body.payload;
        res.send(DBService.find(db, query))
        logger.info({message: "Successfully find data from collection", data: {query}})
    } catch (e) {
        res.status(500).send({message: `Failed to find data from collection`})
        logger.error({message: "Failed to find data from collection"})

    }
})

controller.post("/find-one", (req: Request, res: Response): void => {
    try {
        const db: DB = res.locals.db
        const query: Document = req.body.payload;
        res.send(DBService.findOne(db.collection, query))
        logger.info({message: "Successfully find data from collection", data: {query}})
    } catch (e) {
        res.status(500).send({message: `Failed to find data from collection`})
        logger.error({message: "Failed to find data from collection"})

    }
})

controller.put("/update-many", (req: Request, res: Response): void => {
    try {
        const db: DB = res.locals.db
        const query: { query: Document, $set: Document } = req.body.payload;
        res.send(DBService.updateMany(db, query.query, query.$set))
        logger.info({message: "Successfully updated many data into collection", data: {query}})
    } catch (e) {
        res.status(500).send({message: `Failed to update many data into collection`})
        logger.error({message: "Failed to update many data into collection"})

    }
})

controller.put("/update-one", (req: Request, res: Response): void => {
    try {
        const db: DB = res.locals.db
        const query: { query: Document, document: Document } = req.body.payload;
        res.send(DBService.updateOne(db, query.query, document))
        logger.info({message: "Successfully updated data into collection", data: {query}})
    } catch (e) {
        res.status(500).send({message: `Failed to update data into collection`})
        logger.error({message: "Failed to update data into collection"})

    }
})

controller.delete("/delete-many", (req: Request, res: Response): void => {
    try {
        const db: DB = res.locals.db
        const query: Document = req.body.payload;
        res.send(DBService.deleteMany(db, query))
        logger.info({message: "Successfully deleted many data in collection", data: {query}})
    } catch (e) {
        res.status(500).send({message: `Failed to delete many data in collection`})
        logger.error({message: "Failed to delete many data in collection"})

    }
})

controller.delete("/delete-one", (req: Request, res: Response): void => {
    try {
        const db: DB = res.locals.db
        const query: Document = req.body.payload;
        res.send(DBService.deleteOne(db, query))
        logger.info({message: "Successfully deleted data from collection", data: {query}})
    } catch (e) {
        res.status(500).send({message: `Failed to delete data from collection`})
        logger.error({message: "Failed to delete data from collection"})

    }
})

export default controller