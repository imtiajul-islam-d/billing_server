const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());
// middleware end
// mongodb start
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ibovumw.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
// mongodb end

async function run() {
  try {
    const userCollection = client.db("billing").collection("user");
    const billsCollection = client.db("billing").collection("bills");
    // register an user
    app.post("/api/registration", async (req, res) => {
      const user = req.body;
      // check is the user already available or not
      const email = req.body.email;
      const checkQuery = { email: email };
      const userRegistered = await userCollection.find(checkQuery).toArray();
      if (!userRegistered.length) {
        const result = await userCollection.insertOne(user);
        res.send({
          status: "success",
          data: result,
        });
      }else{
        res.send({
            status: "failed",
            message: "You are already registered!!"
        })
      }
    });
    // get all bill
    app.get("/api/billing-list", async (req, res) => {
      const page = parseInt(req.query.page);
      const size = 10;
      const skipIndex = parseInt(page * size);
      const query = {};
      const cursor = billsCollection.find(query).sort({ time: -1 });
      const bills = await cursor.skip(skipIndex).limit(size).toArray();
      const count = await billsCollection.estimatedDocumentCount();
      res.send({
        status: "success",
        count,
        bills,
      });
    });
    // add a bill
    app.post("/api/add-billing", async (req, res) => {
      const bill = req.body;
      const result = await billsCollection.insertOne(bill);
      res.send({
        status: "success",
        data: result,
      });
    });
    // update a bill
    app.patch("/api/update-billing/:id", async (req, res) => {
      const id = req.params.id;
      const update = req.body;
      const filter = { _id: ObjectId(id) };
      const updatedDocument = {
        $set: {
          bills: update,
        },
      };
      const result = await billsCollection.updateOne(filter, updatedDocument);
      res.send({
        status: "success",
        data: result,
      });
    });
    //   delete a bill
    app.delete("/api/delete-billing/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await billsCollection.deleteOne(filter);
      res.send({
        status: "success",
        data: result,
      });
    });
  } finally {
  }
}
run().catch(console.log);
// body end

app.get("/", async (req, res) => {
  res.send("Running");
});

app.listen(port, () => {
  console.log("Port is running on", port);
});
