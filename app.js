const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const app = express();
const port = process.env.PORT||3000;
require('dotenv').config();


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

const dbName = 'todos';
const url = process.env.MONGODB_URI;

MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
    if (err) {
        console.error(err);
        throw err;
    }
    const db = client.db(dbName);
    console.log(`Connected to MongoDB database '${dbName}'`);

    app.get('/', (req, res) => {
        const tasksCollection = db.collection('tasks');
        tasksCollection.find().toArray((err, tasks) => {
            if(err) throw err;
            res.render('todos', { tasks });
        });
    });
    app.post('/todo', (req, res) => {
        const todo = req.body.todo;
        const tasksCollection = db.collection('tasks');
        tasksCollection.insertOne({task:todo},(err,result)=>{
            if(err) throw err;
            console.log(`Inserted task with ID ${result.insertedId}`);
            res.redirect('/');
        });
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
