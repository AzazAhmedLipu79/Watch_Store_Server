const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");
const ObjectId = require("mongodb").ObjectId;

const { MongoClient } = require("mongodb");

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.llkrc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();

    const database = client.db("NicheStore");
    const productsCollection = database.collection("products");
    // order seperate collection
    const ordersCollection = database.collection("orders");

    //POst APi
    app.post("/addProduct", async (req, res) => {
      const result = await productsCollection.insertOne(req.body);
      console.log(result);
      // Send Api
      res.send(result);
    });
    // Get Product Api

    app.get("/allProducts", async (req, res) => {
      const result = await productsCollection.find({}).toArray();
      res.send(result);
    });

    // Get Single Product
    app.get("/SingleProduct/:id", async (req, res) => {
      const result = await productsCollection
        .find({ _id: ObjectId(req.params.id) })
        .toArray();
      res.send(result[0]);
      console.log(result[0]);
    });
    // Confirm Order
    app.post("/ConfirmOrder", async (req, res) => {
      const result = await ordersCollection.insertOne(req.body);
      res.send(result);
    });
    //My Orders
    app.get("/myOrders/:email", async (req, res) => {
      const result = await ordersCollection
        .find({ email: req.params.email })
        .toArray();
      res.send(result);
    });
    //Delete Order
    app.delete("/deleteOrder/:id", async (req, res) => {
      const result = await ordersCollection.deleteOne({
        _id: ObjectId(req.params.id),
      });
      res.send(result);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello Watch!");
});

app.listen(port, () => {
  console.log(`listening at ${port}`);
});
