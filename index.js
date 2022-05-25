const express = require('express')
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express()
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
        const bookingCollection = client.db("Computer_Shop").collection("booking");
        const userCollection = client.db("Computer_Shop").collection("user");

        // get all tools [http://localhost:4000/computer]
        app.get('/computer', async(req,res)=>{
            const query = {}
            const cursor = computerCollection.find(query)
            const result = await cursor.toArray()
            res.send(result);
        })

        // get all log in user
        app.get('/user' ,async(req,res)=>{
            const users = await userCollection.find().toArray()
            res.send(users)
        })
      

         // get single tools [http://localhost:4000/computer/${id}]
        app.get('/computer/:id',async(req,res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await computerCollection.findOne(query);
            res.send(result)
        })


        // insert booking using insertOne [http://localhost:4000/booking]
        app.post('/booking',async(req,res)=>{
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking)
            res.send(result)
        })

        // get booking user [http://localhost:4000/booking]
        app.get('/booking',async(req,res)=>{
            const bookingEmail = req.query.bookingEmail;
            const query = {bookingEmail:bookingEmail};
            const result = await bookingCollection.find(query).toArray()
            res.send(result)
        })

        // user update||insert  verification
        app.put('/user/:email',async(req,res)=>{
            const email = req.params.email;
            const user = req.body;
            const filter ={email:email};
            const options = {upsert:true};
            const updateDoc ={
                $set:user
            };
            const result = await userCollection.updateOne(filter,updateDoc,options)
            res.send(result)

        })

        // make admin api
        app.put('/user/admin/:email',async(req,res)=>{
            const email = req.params.email;
            const filter ={email:email};
            const updateDoc ={
                $set:{role:'admin'}
            };
            const result = await userCollection.updateOne(filter,updateDoc)
            res.send(result)

        })

        // admin authorization
        app.get('/admin/:email', async(req,res)=>{
            const email = req.params.email;
            const user = await userCollection.findOne({email:email})
            const isAdmin = user.role==='admin';
            res.send({admin:isAdmin})
        })

        // add tools [http://localhost:4000/tools]
        app.post('/tools' ,async(req,res)=>{
            const tools = req.body
            const result = await computerCollection.insertOne(tools)
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