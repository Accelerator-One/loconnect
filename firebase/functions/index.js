// Cloud function Dependencies
const functions = require('firebase-functions');

// Mongo DB Atlas Dependencies
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://admin:F0o9TxsG73tda7UV@loconnect.gq4v2.mongodb.net/location?retryWrites=true&w=majority";

/*---------------------------------------------------------------------*/

// Runtime Configs 
const runtimeOpts_micro = {
    timeoutSeconds: 12,
    memory: '128MB'
};
const runtimeOpts_low = {
    timeoutSeconds: 24,
    memory: '256MB'
};

/*---------------------------------------------------------------------*/
// Helper Functions

async function addDocument({ latitude, longitude, title, description, solution }, uid, email) {

    // Instantiate a Cloud Tasks Client
    const {CloudTasksClient} = require('@google-cloud/tasks');
    const client = new CloudTasksClient();

    // Credentials
    const project = 'test-environment-297411';
    const queue = 'loconnect';
    const location = 'us-central1';
    const url = 'https://toxicity-detector-jzrkk35zba-uc.a.run.app';
    const serviceAccountEmail = 'test-environment-297411@appspot.gserviceaccount.com';

    const parent = client.queuePath(project, location, queue);
    const task = {
        httpRequest: {
          httpMethod: 'POST',
          url,
          headers: { 'Content-Type': 'application/json' },
          oidcToken: {
            serviceAccountEmail,
          },
          body :  Buffer.from(JSON.stringify({ latitude,longitude,location,title,description,solution,uid,email }))
        },
      };

    console.log(JSON.stringify(task));

    // Send create task request.
    const request = {parent, task};
    const [response] = await client.createTask(request);

    const name = response.name;
    // console.log(`Created Task: ${name}`);

    return "OK";
}

async function listDocuments({ latitude, longitude }, uid) {

    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    let response = null;

    try {

        // Establish Client connection
        await client.connect();
        const db = client.db('loconnect');
        const collection = db.collection('location');

        // Setting Filter condition
        const query = {
            latitude: {
                $gte: latitude - 0.5,
                $lte: latitude + 0.5
            },
            longitude: {
                $gte: longitude - 0.5,
                $lte: longitude + 0.5
            },
            resolved: ""
        };

        // Query Options
        const options = {
            limit: 5
        };

        // Returns an array of query responses
        let cursor = await collection.find(query, options);

        if ((await cursor.count()) === 0)
            throw new Error('No Nearby Locations Available');

        response = [];

        await cursor.forEach(res => {
            response.push(res);
        });

    } catch (err) {
        console.error(uid + ":" + JSON.stringify(err.message));
        response = err;
    } finally {
        await client.close();
    }

    return response;

}

async function assignHelper(uid2, { timestamp, uid }) {

    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    let response = null;

    try {

        // Establish Client connection
        await client.connect();
        const db = client.db('loconnect');
        const collection = db.collection('location');

        const filter = { uid, timestamp };

        const update = {
            $set: {
                resolved: uid2
            }
        }

        const options = { upsert: false };

        const result = await collection.updateOne(filter, update, options);

        if (result.matchedCount === 0)
            throw new Error('document_not_present');

        response = "OK";

    } catch (err) {

        console.error(uid2 + ":" + JSON.stringify(err.message));
        response = err;

    } finally {
        await client.close();
    }

    return response;

}

async function irrelevantHelper(uid2, { timestamp, uid }) {

    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    let response = null;

    try {

        // Establish Client connection
        await client.connect();
        const db = client.db('loconnect');
        const collection = db.collection('location');

        const filter = { uid, timestamp };

        const result = await collection.deleteOne(filter);
        if (result.deletedCount === 0)
            throw new Error('no_document_found');

        response = "OK";

    } catch (err) {

        console.error(uid2 + ":" + JSON.stringify(err.message));
        response = err;

    } finally {
        await client.close();
    }

    return response;

}

async function listUndertaken(uid2) {

    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    let response = null;

    try {

        // Establish Client connection
        await client.connect();
        const db = client.db('loconnect');
        const collection = db.collection('location');

        // Setting Filter condition
        const query = {
            resolved: uid2
        };

        // Query Options
        const options = {
            limit: 24
        };

        // Returns an array of query responses
        let cursor = await collection.find(query, options);

        if ((await cursor.count()) === 0)
            throw new Error('No Nearby Locations Available');

        response = [];

        await cursor.forEach(res => {
            response.push(res);
        });

    } catch (err) {

        console.error(uid2 + ":" + JSON.stringify(err.message));
        response = err;

    } finally {
        await client.close();
    }

    return response;

}

async function completed(uid2, { uid, timestamp }) {

    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    let response = null;

    try {

        // Establish Client connection
        await client.connect();
        const db = client.db('loconnect');
        const collection = db.collection('location');

        const filter = { uid, timestamp };

        const result = await collection.deleteOne(filter);
        if (result.deletedCount === 0)
            throw new Error('no_document_found');

        response = "OK";

    } catch (err) {

        console.error(uid2 + ":" + JSON.stringify(err.message));
        response = err;

    } finally {
        await client.close();
    }

    return response;

}

async function rejected(uid2, { uid, timestamp }) {


    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    let response = null;

    try {

        // Establish Client connection
        await client.connect();
        const db = client.db('loconnect');
        const collection = db.collection('location');

        const filter = { uid, timestamp };

        const update = {
            $set: {
                resolved: ""
            }
        }

        const options = { upsert: false };

        const result = await collection.updateOne(filter, update, options);

        if (result.matchedCount === 0)
            throw new Error('document_not_present');

        response = "OK";

    } catch (err) {

        console.error(uid2 + ":" + JSON.stringify(err.message));
        response = err;

    } finally {
        await client.close();
    }

    return response;


}

/*---------------------------------------------------------------------*/
// Cloud Functions

// Add new Report
exports.addEntry = functions.runWith(runtimeOpts_low)
    .https.onCall(async (data, context) => {

        const userRef = context.auth;
        if (userRef.uid === null)
            return "";

        const result = addDocument(data, userRef.uid, userRef.token.email)
            .then(res => res)
            .catch(err => err);

        return result;
    });

// List 5 reports in local area zone                
exports.listEntries = functions.runWith(runtimeOpts_low)
    .https.onCall(async (data, context) => {

        const userRef = context.auth;
        if (userRef.uid === null)
            return "";

        const result = listDocuments(data, userRef.uid)
            .then(res => res)
            .catch(err => err);

        return result;
    });

// Assign Volunteer a specific Issue
exports.assignVolunteer = functions.runWith(runtimeOpts_micro)
    .https.onCall(async (data, context) => {

        const userRef = context.auth;
        if (userRef.uid === null)
            return "";

        const result = assignHelper(userRef.uid, data)
            .then(res => res)
            .catch(err => err);

        return result;
    });

// Mark an issue irrelevant by Volunteer
exports.irrelevantIssue = functions.runWith(runtimeOpts_micro)
    .https.onCall(async (data, context) => {

        const userRef = context.auth;
        if (userRef.uid === null)
            return "";

        const result = irrelevantHelper(userRef.uid, data)
            .then(res => res)
            .catch(err => err);

        return result;
    });

// List volunteer's undertaken tasks
exports.undertakenIssues = functions.runWith(runtimeOpts_low)
    .https.onCall(async (data, context) => {

        const userRef = context.auth;
        if (userRef.uid === null)
            return "";

        const result = listUndertaken(userRef.uid)
            .then(res => res)
            .catch(err => err);

        return result;
    });

// Complete Volunteer's issue
exports.completedIssue = functions.runWith(runtimeOpts_micro)
    .https.onCall(async (data, context) => {

        const userRef = context.auth;
        if (userRef.uid === null)
            return "";

        const result = completed(userRef.uid, data)
            .then(res => res)
            .catch(err => err);

        return result;
    });

// Reject undertaken Issue
exports.rejectIssue = functions.runWith(runtimeOpts_micro)
    .https.onCall(async (data, context) => {

        const userRef = context.auth;
        if (userRef.uid === null)
            return "";

        const result = rejected(userRef.uid, data)
            .then(res => res)
            .catch(err => err);

        return result;
    });
