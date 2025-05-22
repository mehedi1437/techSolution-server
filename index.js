const express = require("express");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

// Middleware
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://findjob-22996.web.app",
  ],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5pbosvq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const usersCollection = client.db("TechDb").collection("usersCollection");
    const priceCollection = client.db("TechDb").collection("priceCollection");
    const teamCollection = client.db("TechDb").collection("teamCollection");
    const serviceCollection = client
      .db("TechDb")
      .collection("serviceCollection");

    // ! user related APIs
    // Get all Users form DB
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    // Add Users into DB
    app.post("/users", async (req, res) => {
      const user = req.body;
      // Insert email if user doesn't exit
      const query = { email: user?.email };
      const isUserExist = await usersCollection.findOne(query);
      if (isUserExist) {
        return res.send({ message: "User Already Exist in the database" });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    //! Make A User TO Admin
    app.patch("/user/makeAdmin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = {
        _id: new ObjectId(id),
      };
      const updatedDoc = {
        $set: {
          userRole: "Admin",
        },
      };

      const result = await usersCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    //  Delete A  User
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    // ! check the user is Admin
    app.get("/user-isAdmin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let admin = false;
      if (user) {
        admin = user?.userRole === "Admin";
      }
      res.send({ admin });
    });

    // ! Service Related APIs
    app.get("/service", async (req, res) => {
      const result = await serviceCollection.find().toArray();
      res.send(result);
    });
    // ? Services Add into Database
    app.post("/service", async (req, res) => {
      const service = req.body;
      const result = await serviceCollection.insertOne(service);
      res.send(result);
    });
    // ? Get a Single Service from db
    app.get("/service/:id", async (req, res) => {
      const id = req.params.id;
      try {
        const query = { _id: new ObjectId(id) };
        const service = await serviceCollection.findOne(query);
        if (!service) {
          return res.status(404).send({ message: "Service not found" });
        }
        res.send(service);
      } catch (error) {
        res.status(500).send({ message: "Server error", error });
      }
    });

    // Delete A service   from Database
    app.delete("/service/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await serviceCollection.deleteOne(query);
      res.send(result);
    });
    //? Update A Serivce
    app.put("/service/:id", async (req, res) => {
      const id = req.params.id;
      const serviceData = req.body;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          ...serviceData,
        },
      };
      const result = await serviceCollection.updateOne(
        query,
        updateDoc,
        options
      );
      res.send(result);
    });

    // ! Price Related APIs started from here
    app.get("/price", async (req, res) => {
      const result = await priceCollection.find().toArray();
      res.send(result);
    });

    //? Get A Single Pricing Plan
    app.get("/price/:id", async (req, res) => {
      const id = req.params.id;
      try {
        const query = { _id: new ObjectId(id) };
        const price = await priceCollection.findOne(query);
        if (!price) {
          return res.status(404).send({ message: "price not found" });
        }
        res.send(price);
      } catch (error) {
        res.status(500).send({ message: "Server error", error });
      }
    });
    //? Update A Pricing Plan
    app.put("/price/:id", async (req, res) => {
      const id = req.params.id;
      const priceData = req.body;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          ...priceData,
        },
      };
      const result = await priceCollection.updateOne(query, updateDoc, options);
      res.send(result);
    });

    // ! Team Related APIs from Here
    // ? Find ALL team Member
    app.get("/teams", async (req, res) => {
      const result = await teamCollection.find().toArray();
      res.send(result);
    });
    // ? Add a New Team Member
    app.post("/team", async (req, res) => {
      const team = req.body;
      const result = await teamCollection.insertOne(team);
      res.send(result);
    });
    // ?  Find A Single Teammember from db
    app.get("/team/:id", async (req, res) => {
      const id = req.params.id;
      try {
        const query = { _id: new ObjectId(id) };
        const team = await teamCollection.findOne(query);
        if (!team) {
          return res.status(404).send({ message: "Service not found" });
        }
        res.send(team);
      } catch (error) {
        res.status(500).send({ message: "Server error", error });
      }
    });
    // Delete A Team Member
     app.delete("/team/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await teamCollection.deleteOne(query);
      res.send(result);
    });
    //? Update A Team Member
    app.put("/team/:id", async (req, res) => {
      const id = req.params.id;
      const teamData = req.body;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          ...teamData,
        },
      };
      const result = await teamCollection.updateOne(
        query,
        updateDoc,
        options
      );
      res.send(result);
    });

    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello from Tech Solution!");
});
app.listen(port, () => console.log(`Server is running on port ${port}`));
