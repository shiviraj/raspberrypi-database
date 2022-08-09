import {NextFunction, Request, Response} from 'express'
import logger from "../logger/logger";

const validateFileName = (fileName: string, res: Response, next: NextFunction) => {
    const regex: RegExp = /[a-zA-Z_][a-zA-Z0-9_-]/;
    if (regex.test(fileName)) {
        return next()
    }
    res.status(400).send({message: `invalid name ${fileName}`})
    logger.error({message: `invalid name`, data: {name: fileName}})
}

const validateDatabaseName = (req: Request, res: Response, next: NextFunction) => {
    try {
        const databaseName: string = req.headers.databasename!.toString();
        validateFileName(databaseName, res, next)
    } catch (e) {
        res.status(400).send({errorMessage: "databasename required in headers"})
    }
}

const validateCollectionName = (req: Request, res: Response, next: NextFunction) => {
    try {
        const collectionName: string = req.headers.collectionname!.toString();
        validateFileName(collectionName, res, next)
    } catch (e) {
        res.status(400).send({errorMessage: "collectionname required in headers"})
    }
}

const authorization = (req: Request, res: Response, next: NextFunction): void => {
    const auth: string = req.headers.authorization || ""
    if (process.env.AUTH !== auth) {
        res.status(401).send({errorMessage: "Unauthorized user"})
        logger.error({message: "Unauthorized user"})
        return
    }
    next()
}


export {validateDatabaseName, validateCollectionName, authorization}