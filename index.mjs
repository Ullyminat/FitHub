import express from 'express'
import { configDotenv } from 'dotenv'
import db_connect from './config/db_connect.mjs'
import cors from 'cors'
import router from './routes/index.mjs'
import helmet from 'helmet'

configDotenv();

db_connect(process.env.DB)
const app = express()
app.use(express.json())

// app.use((req, res, next) => {
//     console.log(req.headers);
//     next();
//   });

app.use(cors({origin:'*'}))
app.use(helmet())
app.use(router)

app.listen(process.env.PORT,(err)=> err ? console.log(err) : console.log(`http://localhost:${process.env.PORT}`));