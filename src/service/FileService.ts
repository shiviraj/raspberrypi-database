import {mkdir, readdirSync, readFileSync, rm, writeFile} from "fs";
import path from "path";
import {DB} from "./DBService";

const pathName = "dist/db"

const FileService = {
  mkdir(name: string): Promise<boolean> {
    const dbName = path.join(pathName, name)
    return new Promise<boolean>((resolve, reject) => {
      return mkdir(dbName, {recursive: true}, (error) => {
        if (error) {
          return reject(false)
        }
        resolve(true)
      })
    })
  },
  rmdir(name: string): Promise<boolean> {
    const dirName = path.join(pathName, name)
    return this.delete(dirName)
  },

  load(): Record<string, Record<string, Array<Document>>> {
    const databases = readdirSync(pathName)
    return databases.reduce((result, database) => {
      const collections = readdirSync(path.join(pathName, database))
      const data = collections.reduce((collectionsData, collection) => {
        const data: Array<Document> = JSON.parse(readFileSync(path.join(pathName, database, collection), 'utf-8'));
        const collectionName = collection.split('.')[0]
        collectionsData[collectionName] = data
        return collectionsData
      }, {} as Record<any, Array<Document>>)
      result[database] = data
      return result
    }, {} as Record<string, Record<string, Array<Document>>>)
  },

  createEmptyFile(dbName: string, collection: string): Promise<boolean> {
    const fileName = path.join(pathName, dbName, `${collection}.json`)
    return new Promise<boolean>((resolve, reject) => {
      writeFile(fileName, "[]", (error) => {
        if (error) {
          return reject(false)
        }
        resolve(true)
      })
    })
  },

  delete(fileName: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      rm(fileName, {recursive: true, force: true}, (error) => {
        if (error) {
          return reject(false)
        }
        resolve(true)
      })
    })
  },

  deleteFile(dbName: string, collection: string): Promise<boolean> {
    const fileName = path.join(pathName, dbName, `${collection}.json`)
    return this.delete(fileName)
  },

  write(db: DB): Promise<boolean> {
    const fileName = path.join(__dirname, "../db", db.databaseName, `${db.collectionName}.json`)
    return new Promise<boolean>((resolve, reject) => {
      writeFile(fileName, JSON.stringify(db.collection), (error) => {
        if (error) {
          return reject(false)
        }
        resolve(true)
      })
    })
  }
}

export default FileService