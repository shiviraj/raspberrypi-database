import cors from 'cors';
import express, {Request, Response} from 'express';
import controller from "./controller";
import {authorization} from "./service/validator";

const app = express();

app.use(cors())
app.use(express.json());

app.get("/", (_req: Request, res: Response): void => {
    res.send({message: "Hello you have just arrived at database server"})
})

app.use(authorization)
app.use(controller)

export default app