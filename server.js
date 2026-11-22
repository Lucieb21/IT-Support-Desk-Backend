require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

// Home page: API guide
app.get("/", (req, res) => {
  const baseURL =
    process.env.RENDER_EXTERNAL_URL ||
    `http://localhost:${process.env.PORT || 3000}`;

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>IT Support Desk API</title>
      <style>
        body { font-family: Arial; margin: 40px; line-height: 1.6; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background: #eeeeee; }
        pre { background: #f4f4f4; padding: 15px; }
      </style>
    </head>
    <body>
      <h1>IT Support Desk Management System</h1>
      <p><strong>Student Number:</strong> 202500006</p>
      <p>This API manages university IT support requests.</p>

      <h2>Live API Base URL</h2>
      <p>${baseURL}</p>

      <h2>Useful Links</h2>
      <p><a href="/health">Health Check</a></p>
      <p><a href="/api/records">View All Records</a></p>

      <h2>Available API Routes</h2>
      <table>
        <tr><th>Method</th><th>Route</th><th>Purpose</th></tr>
        <tr><td>GET</td><td>/</td><td>API Guide</td></tr>
        <tr><td>GET</td><td>/health</td><td>Database Health</td></tr>
        <tr><td>GET</td><td>/api/records</td><td>Get All Records</td></tr>
        <tr><td>GET</td><td>/api/records/:id</td><td>Get One Record</td></tr>
        <tr><td>POST</td><td>/api/records</td><td>Create Record</td></tr>
        <tr><td>PUT</td><td>/api/records/:id</td><td>Update Record</td></tr>
        <tr><td>DELETE</td><td>/api/records/:id</td><td>Delete Record</td></tr>
      </table>

      <h2>Required Input Fields</h2>
      <p>title, category, description and status</p>
      <p>Allowed statuses: Pending, In progress, Completed</p>

      <h2>Example POST and PUT Body</h2>
      <pre>{
  "title": "Broken classroom computer",
  "category": "Hardware",
  "description": "The classroom computer does not start.",
  "status": "Pending"
}</pre>

      <h2>Response Codes</h2>
      <p>200: Successful request</p>
      <p>201: Record created</p>
      <p>400: Invalid input</p>
      <p>404: Record or route not found</p>
      <p>500: Server error</p>
      <p>503: Database unavailable</p>

      <p>Note: An idle hosted service may need some time to start.</p>
    </body>
    </html>
  `);
});

// Database health check
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({
      status: "OK",
      database: "Connected"
    });
  } catch (error) {
    console.error(error);
    res.status(503).json({
      message: "Database unavailable"
    });
  }
});

// Record routes
app.use("/api/records", require("./routes/records"));

// Unknown routes
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found."
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error(error);

  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({
      message: "Invalid JSON format."
    });
  }

  res.status(500).json({
    message: "An unexpected server error occurred."
  });
});

const port = process.env.PORT || 3000;

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});