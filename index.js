import { config } from 'dotenv';
import express from 'express';

config({
  path: '.env.local'
})

const app = express()
const port = process.env.PORT;

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
