import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI!;
const options = {};

let client: MongoClient;
let db: Db;

declare global {
  var _mongoClientPromise: Promise<MongoClient>;
}

// Reuse the client in development
if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}

export const mongoClientPromise = global._mongoClientPromise;