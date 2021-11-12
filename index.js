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
    //Review Collection
    const reviewCollection = database.collection("review");
    //User Collection
    const usersCollection = database.collection("users");
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
    //All Orders
    app.get("/allOrders", async (req, res) => {
      const result = await ordersCollection.find({}).toArray();
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
    //Get Reivew
    app.post("/review", async (req, res) => {
      const result = await reviewCollection.insertOne(req.body);
      res.send(result);
    });
    // Review Api
    app.get("/ReciveReview", async (req, res) => {
      const result = await reviewCollection.find({}).toArray();

      res.send(result);
    });
    // User Info Send
    app.post("/addUserInfo", async (req, res) => {
      const result = await usersCollection.insertOne(req.body);
      res.send(result);
      console.log(result);
    });
    //Check user
    // app.put("/addUserInfo", async (req, res) => {
    //   const user = req.body;
    //   const filter = { email: user.email };
    //   const options = { upsert: true };
    //   const updateDoc = { $set: user };
    //   const result = await usersCollection.updateOne(
    //    filter,
    //    updateDoc,
    //    options
    //  );
    //  res.send(result);
    //});

    //Make Admin Admin
    app.put(`/users/admin`, async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    //Check Admin
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await usersCollection.findOne(query);
      let isAdmin = false;
      if (result?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    //
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
