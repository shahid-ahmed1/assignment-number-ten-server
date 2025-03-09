const express= require('express')
const cors = require ('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());



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
    const reviewCollection = client.db('reviewDB').collection('review')

    const watchlistCollection = client.db('reviewDB').collection('wachlist')
      
    app.get('/review',async(req,res)=>{
      const result = await reviewCollection
      .find({})
      .sort({ rating: -1 })  
      .limit(6)  
      .toArray();
       res.send(result)
    })
    
    app.get("/myWatchlist", async (req, res) => {
     
      const cursor = watchlistCollection.find();
      const result= await cursor.toArray();
      res.send(result)
     
    });
   
    app.get('/review/all',async(req,res)=>{
      const cursor = reviewCollection.find();
      const result= await cursor.toArray();
      res.send(result)
    })

    app.get('/myreview/:email',async(req,res)=>{
      const email = req.params.email
      const result = await reviewCollection.find().toArray()
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
    const result = await reviewCollection.insertOne(newReview)
    res.send(result)
    })
    app.post('/wachlist',async(req,res)=>{
      const newReview = req.body;
      const { title, email } = newReview;  
      const existingGame = await watchlistCollection.findOne({ title, email });
  
      if (existingGame) {
        return res.status(400).json({ message: "Already in Watchlist" }); 
      }
    const result = await watchlistCollection.insertOne(newReview)
    res.send(result)
    })
   
    app.put('/review/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id : new ObjectId(id)};
      const options = {upsert:true};
      const updatedReview = req.body;
      const review={
        $set:{
          image : updatedReview.image, 
          title : updatedReview.title,
          description : updatedReview.description,
          rating : updatedReview.rating,
          year : updatedReview.year,
          genre : updatedReview.genre,
        }
      }
      const result = await reviewCollection.updateOne(query,review,options);

      res.send(result)

    })
    app.delete('/review/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id : new ObjectId(id)};
      const result = await reviewCollection.deleteOne(query);
      res.send(result)
    })
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
  
  }
}
run().catch(console.dir);

app.get('/',(req,res)=>{
    res.send('server is running')
})

app.listen(port,()=>{
    console.log(`this server is running on port ${port}`)
})