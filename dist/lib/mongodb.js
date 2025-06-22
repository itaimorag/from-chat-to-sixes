"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongoClientPromise = void 0;
const mongodb_1 = require("mongodb");
const uri = process.env.MONGODB_URI;
const options = {};
let client;
let db;
// Reuse the client in development
if (!global._mongoClientPromise) {
    client = new mongodb_1.MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
}
exports.mongoClientPromise = global._mongoClientPromise;
