import { supabase, db } from "../utils/supabaseClient.js";
import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function callGroqVisionAPI(base64Image, promptText) {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: promptText,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`, // pass base64 image
              },
            },
          ],
        },
      ],
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 0.7,
      max_completion_tokens: 1024,
      top_p: 1,
      stream: false,
      stop: null,
    });

    return chatCompletion.choices[0].message.content;
  } catch (error) {
    console.error("Groq API Error:", error);
    throw new Error("Failed to analyze image with Groq");
  }
}

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
export async function verifyTask(req, res) {
  try {
    const file = req.file;
    const taskId = req.params.id;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Convert file buffer directly to base64
    const base64Image = file.buffer.toString("base64");

    // Call Groq Vision API with the base64 image
    const analysisResult = await callGroqVisionAPI(
      base64Image,
      "Please analyze this image and verify if it shows legitimate proof of task completion, for design related stuff screenshots are acceptable and for coding prblems problem submission proofs are acceptable. ust say 'yes' or 'no'. but add ## before and after the answer. For example ##yes## or ##no## then state your reasoning in a few sentences."
    );

    console.log("Analysis Result:", analysisResult);

    if (!analysisResult) {
      return res.status(500).json({ error: "Failed to analyze image" });
    }

    // Extract verification result from the format ##yes## or ##no##
    const verificationRegex = /##(yes|no)##/i;
    const match = analysisResult.match(verificationRegex);

    if (!match || match[1].toLowerCase() !== "yes") {
      return res.status(400).json({
        error: "Image does not show legitimate proof of task completion",
        analysis: analysisResult,
      });
    }

    // Update task in database with verification details
    const updateQuery = `
      UPDATE tasks
      SET
        proof_url = $1,
        verified = true,
        points_awarded = $2,
        verification_notes = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4 AND user_id = $5
      RETURNING *;
    `;

    //5 points if the task is main, 2 points if not
    const pointsMain = 5; // Placeholder for points awarded
    const pointsNotMain = 2; // Placeholder for points awarded
    // First query to get the task details
    const taskQuery = `
      SELECT quest_id FROM tasks
      WHERE id = $1 AND user_id = $2;
    `;

    const quest_id = await db.query(taskQuery, [taskId, req.user.id]);

    const questQuery = `
      SELECT is_main FROM quests
      WHERE id = $1 AND user_id = $2;
    `;
    const taskResult = await db.query(questQuery, [
      quest_id.rows[0].quest_id,
      req.user.id,
    ]);
    // Check if the taskResult is true or false if it is not empty
    if (!taskResult.rows[0]) {
      return res.status(404).json({ error: "Task not found" });
    }
    // Check if the taskResult is true or false
    let is_main = false;
    if (taskResult.rows[0].is_main === true) {
      is_main = true;
    }

    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    const is_task_main = is_main;
    const pointsAwarded = is_task_main ? pointsMain : pointsNotMain;

    const result = await db.query(updateQuery, [
      "data:image/jpeg;base64," + base64Image,
      pointsAwarded,
      analysisResult,
      taskId,
      req.user.id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Return success response with verification details
    console.log("Task verification successful:", result.rows[0]);
    res.json({
      success: true,
      data: {
        verified: true,
        points: pointsAwarded,
        analysis: analysisResult,
        task: result.rows[0],
      },
    });
  } catch (error) {
    console.error("Error verifying task:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      details: error.message,
    });
  }
}

// POST /tasks/:id/retry → Retry task verification (placeholder)
export const retryTask = async (req, res) => {
  res.json({ message: "Task retry endpoint placeholder" });
};

// DELETE /tasks/:id → Delete task (placeholder)
export const deleteTask = async (req, res) => {
  res.json({ message: "Task deletion endpoint placeholder" });
};
