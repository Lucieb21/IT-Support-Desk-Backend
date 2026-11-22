const router = require("express").Router();
const pool = require("../db");

const allowedStatuses = ["Pending", "In progress", "Completed"];

function validateRecord(body) {
  const fields = ["title", "category", "description", "status"];

  for (const field of fields) {
    if (typeof body[field] !== "string") {
      return `${field} must be text.`;
    }
  }

  const title = body.title.trim();
  const category = body.category.trim();
  const description = body.description.trim();
  const status = body.status.trim();

  if (title.length < 3 || title.length > 80) {
    return "Title must have 3 to 80 characters.";
  }

  if (category.length < 2 || category.length > 40) {
    return "Category must have 2 to 40 characters.";
  }

  if (description.length < 5 || description.length > 300) {
    return "Description must have 5 to 300 characters.";
  }

  if (!allowedStatuses.includes(status)) {
    return "Status must be Pending, In progress or Completed.";
  }

  return {
    title,
    category,
    description,
    status
  };
}

function validId(id) {
  return /^[1-9]\d*$/.test(id);
}

// GET all records
router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT id, title, category, description, status FROM records ORDER BY id"
    );

    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
});

// GET one record
router.get("/:id", async (req, res, next) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({ message: "Invalid record ID." });
    }

    const result = await pool.query(
      "SELECT id, title, category, description, status FROM records WHERE id = $1",
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Record not found." });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// POST create record
router.post("/", async (req, res, next) => {
  try {
    const record = validateRecord(req.body);

    if (typeof record === "string") {
      return res.status(400).json({ message: record });
    }

    const result = await pool.query(
      `INSERT INTO records (title, category, description, status)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, category, description, status`,
      [record.title, record.category, record.description, record.status]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// PUT update record
router.put("/:id", async (req, res, next) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({ message: "Invalid record ID." });
    }

    const record = validateRecord(req.body);

    if (typeof record === "string") {
      return res.status(400).json({ message: record });
    }

    const result = await pool.query(
      `UPDATE records
       SET title = $1, category = $2, description = $3, status = $4
       WHERE id = $5
       RETURNING id, title, category, description, status`,
      [
        record.title,
        record.category,
        record.description,
        record.status,
        req.params.id
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Record not found." });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// DELETE record
router.delete("/:id", async (req, res, next) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({ message: "Invalid record ID." });
    }

    const result = await pool.query(
      "DELETE FROM records WHERE id = $1 RETURNING id",
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Record not found." });
    }

    res.status(200).json({ message: "Record deleted." });
  } catch (error) {
    next(error);
  }
});

module.exports = router;