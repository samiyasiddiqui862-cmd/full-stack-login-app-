const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: "postgres",
  password: "uzzi@23092006",
  host: "localhost",
  port: 5432,
  database: "authdb",
});

module.exports = pool;
