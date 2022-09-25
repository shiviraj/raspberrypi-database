import FileService from "./FileService";
import _ from "lodash"
import {randomUUID} from "crypto";
import {NextFunction, Request, Response} from "express";
import {DuplicateKeyError} from "../error/DuplicateKeyError";

export type Document = Record<string, any>
export type DB = { database: Record<string, Array<Document>>; databaseName: string; collection: Array<Document>; collectionName: string }
const databases = FileService.load()

const DBService = {
  createDatabase(name: string): string {
    if (!databases.hasOwnProperty(name)) {
      databases[name] = {}
    }
    FileService.mkdir(name).catch()
    return name
  },

  deleteDatabase(databaseName: string) {
    delete databases[databaseName];
    FileService.rmdir(databaseName).catch()
    return databaseName
  },

  createCollection(dbName: string, collection: string): string {
    const database = databases[dbName]!
    if (!database.hasOwnProperty(collection)) {
      database[collection] = []
      FileService.createEmptyFile(dbName, collection).catch()
    }
    return collection
  },

  deleteCollection(dbName: string, collection: string): string {
    const database = databases[dbName]!
    delete database[collection];
    FileService.deleteFile(dbName, collection).catch()
    return collection
  },

  insert(collection: Array<Document>, payload: Document): Document {
    if (payload.hasOwnProperty("_id") && collection.some(this.isMatched({_id: payload._id}))) {
      throw new DuplicateKeyError()
    } else {
      payload._id = payload._id || randomUUID()
      collection.push(payload)
      return payload
    }
  },

  insertOne(db: DB, payload: Document): Document {
    const result = this.insert(db.collection, payload)
    FileService.write(db).catch()
    return result
  },

  getCollection(dbName: string, collection: string): Array<Document> {
    return databases[dbName]![collection]!
  },

  insertMany(db: DB, payloads: Array<Document>): Array<Document> {
    const result = payloads.map((payload) => this.insert(db.collection, payload))
    FileService.write(db).catch()
    return result
  },

  validateDatabase(req: Request, res: Response, next: NextFunction) {
    const databaseName: string = req.headers.databasename!.toString();
    if (databases.hasOwnProperty(databaseName)) {
      return next()
    }
    res.status(400).send({errorMessage: "database does not exists"})
  },

  validateCollection(req: Request, res: Response, next: NextFunction) {
    const databaseName: string = req.headers.databasename!.toString();
    if (!databases.hasOwnProperty(databaseName)) {
      res.status(400).send({errorMessage: "database is not exists"})
      return
    }
    const database = databases[databaseName]!
    const collectionName: string = req.headers.collectionname!.toString();
    if (!database.hasOwnProperty(collectionName)) {
      res.status(400).send({errorMessage: "collection is not exists"})
      return
    }
    res.locals.db = {databaseName, collectionName, database, collection: database[collectionName]}
    next()
  },

  find(db: DB, query: Document): Array<Document> {
    return _.filter(db.collection, _.matches(query))
  },

  findOne(collection: Array<Document>, query: Document, exact: boolean = true): Document | null {
    if (exact) {
      return _.find(collection, query) || null
    }
    return collection.find(this.isMatched(query, exact)) || null
  },

  update(db: DB, query: Document, updatedDocument: Document): Document {
    const index = db.collection.findIndex(this.isMatched(query))
    const document = db.collection[index]
    db.collection[index] = {...document, ...updatedDocument, _id: document._id}
    return db.collection[index]
  },

  updateMany(db: DB, query: Document, updatedDocument: Document): Array<Document> {
    const collections = this.find(db, query)
    const result = collections.map((collection) => {
      return this.update(db, collection, updatedDocument);
    })
    FileService.write(db).catch()
    return result
  },

  updateOne(db: DB, query: Document, updatedDocument: Document): Document {
    const document = this.update(db, query, updatedDocument);
    FileService.write(db).catch()
    return document
  },

  isMatched(query: Document, exact: boolean = true): (document: Document) => boolean {
    return (document: Document) => Object.keys(query).every(key => {
      return exact ? query[key] === document[key] : document[key].startsWith(query[key]);
    });
  },

  isNotMatched(query: Document): (document: Document) => boolean {
    return (document: Document) => !Object.keys(query).every(key => query[key] === document[key]);
  },

  deleteOne(db: DB, query: Document): Document {
    const index = db.collection.findIndex(this.isMatched(query))
    const document = db.collection[index]
    db.collection.splice(index, 1)
    FileService.write(db).catch()
    return document
  },

  deleteMany(db: DB, query: Document): Array<Document> {
    const documents = this.find(db, query)
    db.collection = db.collection.filter(this.isNotMatched(query))
    FileService.write(db).catch()
    return documents
  }
}

export default DBService