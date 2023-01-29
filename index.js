const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
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
