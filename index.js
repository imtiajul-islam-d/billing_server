const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
// const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());
// verify jwt
// function verifyJWT(req, res, next) {
//   const authHeader = req.headers.authorization;
//   if (!authHeader) {
//     return res.status(401).send({ message: "unauthorized access" });
//   }
//   const token = authHeader.split(" ")[1];
//   jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
//     if (err) {
//       console.log(err);
//       return res.status(403).send({ message: "forbidden access" });
//     }
//     req.decoded = decoded;
//     next();
//   });
// }
// middleware end
// mongodb start
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ibovumw.mongodb.net/?retryWrites=true&w=majority`;
// const uri = "mongodb://localhost:27017"
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xbnuhk5.mongodb.net/?retryWrites=true&w=majority`;
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

    // jwt
    // app.get("/jwt", async (req, res) => {
    //   // take the email address from user
    //   const email = req.query.email;
    //   // check the user, is it in our database or not
    //   // make a query to find the user in our database
    //   const quey = { email: email };
    //   const user = await userCollection.findOne(quey);
    //   // if user found then, cook a token for the user, demo is in the below
    //   if (user) {
    //     const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
    //       expiresIn: "24h",
    //     });
    //     return res.send({ accessToken: token });
    //   }
    //   // if no user found, send him/ her the status '403' with a blank access token
    //   res.status(403).send({ accessToken: "" });
    // });
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
      } else {
        res.send({
          status: "failed",
          message: "You are already registered!!",
        });
      }
    });
    // get login info
    app.post("/api/login", async (req, res) => {
      const email = req.body.email;
      const password = parseInt(req.body.password);
      console.log(password);
      const query = { email: email };
      const result = await userCollection.find(query).toArray();
      const dbPass = parseInt(result[0].password);
      console.log(dbPass);
      if (result.length) {
        if (dbPass === password) {
          res.send({
            status: "success",
            data: result,
          });
        } else {
          res.send({
            status: "failed",
            message: "Wrong password",
          });
        }
      } else {
        res.send({
          status: "failed",
          message: "You are not registered! Please register...",
        });
      }
    });
    // get all paid amount
    app.get("/api/billing-list/amount", async (req, res) => {
      const query = {};
      const result = await billsCollection.find(query).toArray();
      // let total = 0;
      // const re = result.map(item => total + item.bills.amount)
      // console.log(re)
      // console.log(result.bills);
      res.send({
        status: "success",
        data: result,
      });
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
    // get search result
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
