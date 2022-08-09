import FileService from "./FileService";
import {randomUUID} from "crypto";
import {NextFunction, Request, Response} from "express";

export type DB = { database: Map<string, Array<Document>>; databaseName: string; collection: Array<Document>; collectionName: string }
export type Document = {}
const databases = FileService.load()
console.log(databases)

const DBService = {
    createDatabase(name: string): string {
        if (!databases.has(name)) {
            databases.set(name, new Map())
        }
        FileService.mkdir(name).then()
        return name
    },

    createCollection(dbName: string, collection: string): string {
        const database = databases.get(dbName)!
        if (!database.has(collection)) {
            database.set(collection, [])
            FileService.createEmptyFile(dbName, collection).then()
        }
        return collection
    },

    insert(collection: Array<Document>, payload: Document): Document {
        const data = {...payload, _id: randomUUID()}
        collection.push(data)
        return data
    },

    insertOne(db: DB, payload: Document): Document {
        const result = this.insert(db.collection, payload)
        FileService.write(db).then()
        return result
    },

    getCollection(dbName: string, collection: string): Array<any> {
        return databases.get(dbName)!!.get(collection)!!
    },

    insertMany(db: DB, payloads: Array<Document>): Array<Document> {
        const result = payloads.map((payload) => this.insert(db.collection, payload))
        FileService.write(db).then()
        return result
    },

    validateDatabase(req: Request, res: Response, next: NextFunction) {
        const databaseName: string = req.headers.databasename!.toString();
        if (databases.has(databaseName)) {
            return next()
        }
        res.status(400).send({errorMessage: "database does not exists"})
    },

    validateCollection(req: Request, res: Response, next: NextFunction) {
        const databaseName: string = req.headers.databasename!.toString();
        if (!databases.has(databaseName)) {
            res.status(400).send({errorMessage: "database is not exists"})
            return
        }
        const database = databases.get(databaseName)!
        const collectionName: string = req.headers.collectionname!.toString();
        if (!database.has(collectionName)) {
            res.status(400).send({errorMessage: "collection is not exists"})
            return
        }
        res.locals.db = {databaseName, collectionName, database, collection: database.get(collectionName)!}
        next()
    },
}

export default DBService