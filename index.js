import express from 'express'
import { config } from 'dotenv'
import cors from 'cors'
import helmet from 'helmet'
import Router from './routes/index.js'
import Conn from './database/config.js'
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser'
import redis from 'redis';


config()
const app = express()

// config({ path: `.env.${process.env.NODE_ENV}` })

app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true }));

//app.use(cors());


app.use(cors({ origin: 'https://hub6.vercel.app', credentials: true }));



app.use(cookieParser())



app.use(helmet())
app.use(Router)
app.use((err, req, res, next) => {
  console.log(err)
  res.status(err.status || 500).json({
    status: 'error',
    statusCode: err.status,
    message: err.message,
    data: '',
  })
})


const redisClient= redis.createClient({
  url:'redis://red-cls9k9bip8as739p19a0:6379'
})

redisClient.on('connect',()=>{
  console.log('redis connected succesfully');
})

redisClient.on('connect',(err)=>{
  console.log('error connecting to redis',err);
})



const PORT = process.env.PORT || 8080
const initDb = () => {
  Conn.then(() => {
    console.log('Connection to Database successful')
    app.listen(PORT,'0.0.0.0', () => {
      console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`)
    })
  })
}

initDb()
