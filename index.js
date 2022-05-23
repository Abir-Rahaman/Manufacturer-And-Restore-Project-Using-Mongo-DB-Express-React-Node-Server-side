const express = require('express')
const cors = require('cors');
const app = express()
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 4000;
require ('dotenv').config();

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.NAME}:${process.env.PASS}@computer-shop.oyvkd.mongodb.net/?retryWrites=true&w=majority";`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const computerCollection = client.db("Computer_Shop").collection("Parts");

        // get all tools [http://localhost:4000/computer]
        app.get('/computer', async(req,res)=>{
            const query = {}
            const cursor = computerCollection.find(query)
            const result = await cursor.toArray()
            res.send(result);
        })

         // get single tools [http://localhost:4000/computer/${id}]
        app.get('/computer/:id',async(req,res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await computerCollection.findOne(query);
            res.send(result)
        })
       
    }
    finally{
        // client.close();

    }
}

app.get('/', (req, res) => {
    res.send('Hello from Computer shop')
  })
  
 app.listen(port, () => {
    console.log(` Done With Computer shop ${port}`)
  })
run().catch(console.dir);