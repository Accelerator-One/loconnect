// Cloud function Dependencies
const functions = require('firebase-functions');

// Mongo DB Atlas Dependencies
const MongoClient = require('mongodb').MongoClient;
const uri = "MONGODB_URI_HERE";

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
    const project = 'GCP_PROJECT_ID_HERE';
    const queue = 'CLOUD_TASKS_UID_HERE';
    const location = 'YOUR_REGION_HERE';
    const url = 'DEPLOYED_CLOUD_RUN_URI_HERE';
    const serviceAccountEmail = 'SERVICE_ACCOUNT_HERE';

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
        const db = client.db('MONGO_DB_HERE');
        const collection = db.collection('MONGO_COLLECTION_HERE');

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
        const db = client.db('MONGO_DB_HERE');
        const collection = db.collection('MONGO_COLLECTION_HERE');

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
        const db = client.db('MONGO_DB_HERE');
        const collection = db.collection('MONGO_COLLECTION_HERE');

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
        const db = client.db('MONGO_DB_HERE');
        const collection = db.collection('MONGO_COLLECTION_HERE');

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
        const db = client.db('MONGO_DB_HERE');
        const collection = db.collection('MONGO_COLLECTION_HERE');

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
        const db = client.db('MONGO_DB_HERE');
        const collection = db.collection('MONGO_COLLECTION_HERE');

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
