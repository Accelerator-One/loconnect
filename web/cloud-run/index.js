// Environment Dependencies
const express = require('express');
const bodyParser = require('body-parser');

// Tensorflow dependencies
const tf = require('@tensorflow/tfjs-node');
const toxicity = require('@tensorflow-models/toxicity');

// Mongo DB Atlas Dependencies
const MongoClient = require('mongodb').MongoClient;
const uri = "INSTANCE_URI_HERE";

// Constructs
const app = express();
app.use(bodyParser.json());

// Development Port Declaration
const port = 8080;
app.listen(port, () => console.log(`App listening at PORT: ${port} at hostname: '0.0.0.0'`));

// Endpoint Configuration
app.post('/', async function (req, res) {

    // wrangled-data
    const { latitude, longitude, title, description, solution, uid, email } = req.body;
    const timestamp = Date.now();

    // toxicity-detector args
    const validate = title + ". " + description + ". " + solution + ".";
    const threshold = 0.80;

    // mongodb instantiation
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    let response = null;

    // toxicity-detection
    await toxicity.load(threshold).then(model => {
        model.classify(validate).then(async (predictions) => {

            // Check if any label is violated
            predictions.forEach(result => {
                if (result.results[0].match === true)
                    throw new Error("Label violated: " + result.label);
            })

            // Send to MongoDB (if clean)
            try {

                await client.connect();
                const db = client.db('MONGO_DB_HERE');
                const collection = db.collection('MONGO_COLLECTION_HERE');

                const document = {
                    uid, email, timestamp,
                    latitude, longitude,
                    title, description, solution,
                    resolved: ""
                };

                const result = await collection.insertOne(document);
                console.log(uid + ':insert:' + result.insertedId);
                response = "OK";

            } catch (err) {

                console.error(uid + ":" + JSON.stringify(err.message));
                response = err;

            } finally {
                await client.close();
            }

        });
    })
        .catch(err => {
            // console.log(err);
            res.send(err);
        });

    return res.send(response);

});
