import cors from 'cors';
import express, {NextFunction, Request, Response} from 'express';
import controller from "./controller";
import {authorization} from "./service/validator";
import logger from "./logger/logger";

const app = express();

app.use(cors())
app.use(express.json());

app.get("/", (_req: Request, res: Response): void => {
  res.send({message: "Hello you have just arrived at database server"})
})

app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info({message: "Received Request", data: {method: req.method, url: req.url}})
  const send = res.send
  res.send = function (data: any) {
    logger.info({
      message: "Response for the request",
      data: {method: req.method, url: req.url, statusCode: res.statusCode}
    })
    return send.call(this, data)
  }
  next()
})

app.use(authorization)
app.use(controller)

export default app