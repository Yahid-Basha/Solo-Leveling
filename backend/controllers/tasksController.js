import { db } from "../utils/supabaseClient.js";

// POST /tasks → Create new task
export const createTask = async (req, res) => {
  const {
    quest_id,
    title,
    description,
    due_date,
    points_awarded = 0,
  } = req.body;

  if (!quest_id || !title) {
    return res.status(400).json({ error: "Quest ID and title are required" });
  }

  const query = `
    INSERT INTO tasks (
      user_id, quest_id, title, description, 
      due_date, points_awarded, status
    )
    VALUES ($1, $2, $3, $4, $5, $6, 'pending')
    RETURNING *;
  `;

  try {
    const result = await db.query(query, [
      req.user.id,
      quest_id,
      title,
      description,
      due_date,
      points_awarded,
    ]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error creating task" });
  }
};

// GET /tasks → Get user's tasks
export const getTasks = async (req, res) => {
  const { quest_id } = req.query;

  let query = `
    SELECT * FROM tasks
    WHERE user_id = $1
  `;
  const params = [req.user.id];

  if (quest_id) {
    query += ` AND quest_id = $2`;
    params.push(quest_id);
  }

  query += ` ORDER BY created_at DESC`;

  try {
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error fetching tasks" });
  }
};

// PUT /tasks/:id → Update task
// Update the updateTask function
export const updateTask = async (req, res) => {
  console.log("Update Task - Request Parameters:", {
    taskId: req.params.id,
    userId: req.user.id,
    body: req.body,
  });

  const { id } = req.params;
  const { title, description, due_date, status, proof_url } = req.body;

  // Validate status value
  const validStatuses = ["not_started", "in_progress", "completed", "pending"];
  if (status && !validStatuses.includes(status)) {
    console.log("Update Task - Invalid Status:", status);
    return res.status(400).json({
      error:
        "Invalid status value. Must be one of: not_started, in_progress, completed, pending",
    });
  }

  const query = `
    UPDATE tasks
    SET 
      title = COALESCE($1, title),
      description = COALESCE($2, description),
      due_date = COALESCE($3, due_date),
      status = COALESCE($4, status),
      completed_at = CASE 
        WHEN $4 = 'completed' AND status != 'completed' 
        THEN CURRENT_TIMESTAMP 
        ELSE completed_at 
      END,
      verified = CASE 
        WHEN $4 = 'completed' THEN false
        ELSE verified 
      END,
      proof_url = COALESCE($5, proof_url),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $6 AND user_id = $7
    RETURNING *;
  `;

  try {
    console.log("Update Task - Query Parameters:", [
      title,
      description,
      due_date,
      status,
      proof_url,
      id,
      req.user.id,
    ]);

    const result = await db.query(query, [
      title,
      description,
      due_date,
      status,
      proof_url,
      id,
      req.user.id,
    ]);

    console.log("Update Task - Query Result:", result.rows[0]);

    if (result.rows.length === 0) {
      console.log("Update Task - No rows found for ID:", id);
      return res.status(404).json({ error: "Task not found" });
    }

    // Return success response with updated task
    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Update Task - Database Error:", {
      error: error.message,
      detail: error.detail,
      constraint: error.constraint,
    });
    console.error("Database error:", error);
    res.status(500).json({
      success: false,
      error: "Database error updating task",
    });
  }
};
// POST /tasks/:id/verify → Verify task completion (placeholder)
export const verifyTask = async (req, res) => {
  res.json({ message: "Task verification endpoint placeholder" });
};

// POST /tasks/:id/retry → Retry task verification (placeholder)
export const retryTask = async (req, res) => {
  res.json({ message: "Task retry endpoint placeholder" });
};

// DELETE /tasks/:id → Delete task (placeholder)
export const deleteTask = async (req, res) => {
  res.json({ message: "Task deletion endpoint placeholder" });
};
