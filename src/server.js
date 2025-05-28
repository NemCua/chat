import express from 'express'
const app = express()
const port = 3200
import mongoose from 'mongoose'
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));


app.set('view engine', 'ejs');



mongoose.connect("mongodb+srv://nemcuaa1:n4uEFLbYEx8yaG7N@cluster0.03atdbi.mongodb.net/Shop?retryWrites=true&w=majority&appName=Cluster0")
    .then(()=>{
        console.log("connect to mongo")
    })
    .catch(()=>{
        console.log("connect fail to mongo")
    })


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

