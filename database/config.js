import mongoose from 'mongoose'
import { config } from 'dotenv'

config()

const hosted=process.env.URI
const local=process.env.LOCAL_URI
const uri=hosted
const Conn = mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((conn) => conn.connection)
  .catch((err) => {
    console.log(`Failed to connect to database ${err}`)
    throw new Error(err)
  })

export default Conn
