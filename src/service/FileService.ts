import {mkdir, readdirSync, readFileSync, writeFile} from "fs";
import path from "path";
import {DB} from "./DBService";

const pathName = "dist/db"

const FileService = {
    mkdir(name: string) {
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

    load(): Map<string, Map<string, Array<any>>> {
        const databases = readdirSync(pathName)
        return databases.reduce((result, database) => {
            const collections = readdirSync(path.join(pathName, database))
            const data = collections.reduce((collectionsData, collection) => {
                const data: Array<any> = JSON.parse(readFileSync(path.join(pathName, database, collection), 'utf-8'));
                const collectionName = collection.split('.')[0]
                collectionsData.set(collectionName, data)
                return collectionsData
            }, new Map<string, Array<any>>())
            result.set(database, data)
            return result
        }, new Map<string, Map<string, Array<any>>>())
    },

    createEmptyFile(dbName: string, collection: string) {
        const fileName = path.join(pathName, dbName, `${collection}.json`)
        return new Promise<boolean>((resolve, reject) => {
            writeFile(fileName, "[]", (error) => {
                if (error) {
                    return reject(false)
                }
                console.log(`created file ${fileName}`)
                resolve(true)
            })
        })
    },

    write(db: DB) {
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