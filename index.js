const express= require('express')
const cors = require ('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.db_user}:${process.env.db_password}@cluster0.nukrg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    const reviewCollection = client.db('reviewDB').collection('review')
    app.get('/review',async(req,res)=>{
      const result = await reviewCollection
      .find({})
      .sort({ rating: -1 })  
      .limit(6)  
      .toArray();
       res.send(result)
    })

    app.get('/review/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }; 
      const review = await reviewCollection.findOne(query);
      res.send(review);
  });

    app.post('/review',async(req,res)=>{
    const newReview = req.body;
    console.log(newReview);
    const result = await reviewCollection.insertOne(newReview)
    res.send(result)
    })
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/',(req,res)=>{
    res.send('server is running')
})

app.listen(port,()=>{
    console.log(`this server is running on port ${port}`)
})