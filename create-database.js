require("dotenv").config();

const fs = require("fs");
const pool = require("./db");

async function setupDatabase() {
  try {
    const schema = fs.readFileSync("./schema.sql", "utf8");
    await pool.query(schema);

    console.log("Database table created successfully!");

    const seed = fs.readFileSync("./seed.sql", "utf8");
    await pool.query(seed);

    console.log("Sample records inserted successfully!");
  } catch (error) {
    console.error("Database setup failed:", error.message);
  } finally {
    await pool.end();
  }
}

setupDatabase();