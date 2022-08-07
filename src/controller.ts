import express, {Request, Response} from 'express'
import {validateCollectionName, validateDatabaseName} from "./service/validator";
import DBService, {DB} from "./service/DBService";

const controller = express.Router()

controller.use(validateDatabaseName)

controller.post("/create/database", (req: Request, res: Response): void => {
    const name: string = req.headers.databasename!.toString()
    const dbName = DBService.createDatabase(name)
    res.send({message: `successfully created database ${dbName}`})
})

controller.use(validateCollectionName)

controller.post("/create/collection", DBService.validateDatabase, (req: Request, res: Response): void => {
    const dbName: string = req.headers.databasename!.toString()
    const collection: string = req.headers.collectionname!.toString()
    const collectionName = DBService.createCollection(dbName, collection)
    res.send({message: `successfully created collection ${collectionName}`})
})

controller.use(DBService.validateCollection)

controller.post("/insert-one", (req: Request, res: Response): void => {
    const db: DB = res.locals.db
    const result = DBService.insertOne(db, req.body.payload)
    res.send(result)
})

controller.post("/insert-many", (req: Request, res: Response): void => {
    const db: DB = res.locals.db
    const data = DBService.insertMany(db, req.body.payload)
    res.send(data)
})

controller.post("/find-all", (_req: Request, res: Response): void => {
    const db: DB = res.locals.db
    res.send(db.collection)
})

// @ts-ignore
export default controller