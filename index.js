const express = require('express')
require ('dotenv').config();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const stripe = require("stripe")(process.env.SECRET_STRIPE_KEY);


const port = process.env.PORT || 4000;


// app.use(cors({origin: 'আপনার ফায়ারবেইজের লাইভ লিংক'})
app.use(cors({origin:'https://assignment-12-authentication.web.app'}));
app.use(express.json())

const uri = `mongodb+srv://${process.env.NAME}:${process.env.PASS}@computer-shop.oyvkd.mongodb.net/?retryWrites=true&w=majority";`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const computerCollection = client.db("Computer_Shop").collection("Parts");
        const bookingCollection = client.db("Computer_Shop").collection("booking");
        const userCollection = client.db("Computer_Shop").collection("user");
        const reviewCollection = client.db("Computer_Shop").collection("Review");
        const paymentCollection = client.db("Computer_Shop").collection("payments");
        const userProfileCollection = client.db("Computer_Shop").collection("profile");

        // get all tools [http://localhost:4000/computer]
        app.get('/computer', async(req,res)=>{
            const query = {}
            const cursor = computerCollection.find(query)
            const result = await cursor.limit(3).toArray()
            res.send(result);
        })
        
        app.get('/allComputer', async(req,res)=>{
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

        // payment method
        app.post("/create-payment-intent",async(req,res)=>{
            const {productPrice} = req.body;
            const amount = productPrice*100;
            console.log(amount);
            const paymentIntent = await stripe.paymentIntents.create({
              amount:amount,
              currency:"usd",
              payment_method_types:['card']
            });
            res.send({clientSecret : paymentIntent.client_secret})
             
          })

        // Update & Insert Payment Method 
          app.patch('/booking/:id',async(req,res)=>{
            const id = req.params.id;
            const payment = req.body;
            const filter = {_id: ObjectId(id)}
            const updateDoc = {
              $set:{
                paid:true,
                transactionId : payment.transaction,
              }
            }
            const result = await paymentCollection.insertOne(payment)
            const updateBooking = await bookingCollection.updateOne(filter,updateDoc)
            res.send(updateBooking)
          })


        // admin authorization
        app.get('/admin/:email', async(req,res)=>{
            const email = req.params.email;
            const user = await userCollection.findOne({email:email})
            const isAdmin = user.role==='admin';
            res.send({admin:isAdmin})
        })

       
        // Save Profile Data [http://localhost:4000/profile]
        app.post('/profile' ,async(req,res)=>{
            const ProfileData = req.body
            const result = await userProfileCollection.insertOne(ProfileData)
            res.send(result)
        })


        // add tools [http://localhost:4000/tools]
        app.post('/computer',async(req,res)=>{
            const computerTools = req.body;
            const result = await computerCollection.insertOne(computerTools)
            res.send(result);
        })

       // update Quantity Using Put Api By id [http://localhost:4000/tools/${id}]
        app.put('/tools/:id' ,async(req,res) =>{
            const id = req.params.id;
            console.log(id);
            const updateQuantity = req.body;
            console.log(updateQuantity);
            const filter = {_id:ObjectId(id)}
            const option = { upsert : true}
            const updateDoc ={
            $set:{
                quantity : updateQuantity.newQuantity
            }
            }
            const result = await computerCollection.updateOne(filter,updateDoc,option);
            res.send(result);
        })        

            

        // get all review [http://localhost:4000/review]
        app.get('/review', async(req,res)=>{
            const query = {}
            const cursor = reviewCollection.find(query)
            const result = await cursor.toArray()
            res.send(result);
        })

        // insert review by user [http://localhost:4000/Review]
        app.post('/Review' ,async(req,res)=>{
            const Review = req.body
            const result = await reviewCollection.insertOne(Review)
            res.send(result)
        })

        // payment get Api [http://localhost:4000/booking/${id}]
        app.get('/booking/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await bookingCollection.findOne(query);
            res.send(result)

        })


        app.delete( '/tools/:id' ,async(req,res)=>{
            const id = req.params.id;
            const query = {_id:ObjectId(id)}
            const result = await computerCollection.deleteOne(query);
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