const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion,
  //  MongoRuntimeError 
} = require('mongodb');

require('dotenv').config();
const port = process.env.PORT || 5000;

// const bcrypt = require('bcrypt-nodejs');


app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.x91i4gg.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function verifyToken(req, res, next) {
  if (req.headers?.authorization?.startsWith('Bearer ')) {
    const token = req.headers.authorization.split(' ')[1];

    try {
      const decodedUser = await admin.auth().verifyIdToken(token);
      req.decodedEmail = decodedUser.email;
    }
    catch {

    }
  }
  next();
}

async function run() {
  try {

    await client.connect();
    console.log("DB connected Successfully");
    const database = client.db('health_care');


    const usersCollection = database.collection('users');
    const reviewCollection = database.collection('review');
    const eventCollection = database.collection('event');
    const appointmentCollection = database.collection('appointment');


    app.post('/review', async (req, res) => {
      const data = req.body;
      const store = await reviewCollection.insertOne(data);
      // console.log(data);
      // res.json({message: 'hello'})
      res.json(store);
    });

    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      console.log(result);
      res.json(result);
    });

    app.put('/users', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });

    app.get('/users', async (req, res) => {
      const users = await usersCollection.find().toArray();
      res.send(users);
    });

    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === 'admin') {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    app.get('/users/doctor/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isDoctor = false;
      if (user?.role === 'doctor') {
        isDoctor = true;
      }
      res.json({ doctor: isDoctor });
    });

    app.put('/users/admin/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };

      console.log(filter);
      const updateDoc = { $set: { role: 'admin' } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    app.delete('/users/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const result = await usersCollection.deleteOne(filter);
      res.json(result);
    });

    app.put('/users/addDoctor', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: 'doctor' } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
  });

  app.post('/addEvent', async (req, res) => {
    const event = req.body;
    const result = await eventCollection.insertOne(event);
    console.log(result);
    res.json(result);
  });

  app.get('/events', async (req, res) => {
    const users = await eventCollection.find().toArray();
    res.send(users);
  });

  app.post('/appointment', async (req, res) => {
    const appointment = req.body;
    const result = await appointmentCollection.insertOne(appointment);
    console.log(result);
    res.json(result);
  });

  app.get('/appointment', async (req, res) => {
    const users = await appointmentCollection.find().toArray();
    res.send(users);
  });

  }
  finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello from Health Care')
})





// app.get('/users', async(req,res) => {
//   const users = await usersCollection.find().toArray();
//   res.send(users);
// });


app.listen(port, () => {
  console.log(`Health Care App Server listening on port ${port}`)
})