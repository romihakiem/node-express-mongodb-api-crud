const db = require("../configs/db");
const { MongoClient } = require("mongodb");

const client = new MongoClient(db.URL);

module.exports = client;
