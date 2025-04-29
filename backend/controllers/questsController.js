import { db } from "../utils/supabaseClient.js";

// POST /quests → Insert new quest
export const createQuest = async (req, res) => {
  const { title, is_main } = req.body;

  if (!title) return res.status(400).json({ error: "Title is required" });

  const quarter = getCurrentQuarter();
  const query = `
    INSERT INTO quests (user_id, title, is_main, quarter)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;

  try {
    const result = await db.query(query, [
      req.user.id,
      title,
      is_main,
      quarter,
    ]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error inserting quest" });
  }
};

// GET /quests → Fetch user's quests
export const getQuests = async (req, res) => {
  const query = `
    SELECT * FROM quests
    WHERE user_id = $1
    ORDER BY created_at DESC;
  `;

  try {
    const result = await db.query(query, [req.user.id]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error fetching quests" });
  }
};

// GET /quests/:id → Fetch quest by ID
export const getQuestById = async (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT * FROM quests
    WHERE id = $1 AND user_id = $2;
  `;

  try {
    const result = await db.query(query, [id, req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Quest not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error fetching quest" });
  }
};

// PUT /quests/:id → Update quest
export const updateQuest = async (req, res) => {
  const { id } = req.params;
  const { title, is_main, completed, progress } = req.body;

  const query = `
    UPDATE quests
    SET 
      title = COALESCE($1, title),
      is_main = COALESCE($2, is_main),
      completed = COALESCE($3, completed),
      progress = COALESCE($4, progress),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $5 AND user_id = $6
    RETURNING *;
  `;

  try {
    const result = await db.query(query, [
      title,
      is_main,
      completed,
      progress,
      id,
      req.user.id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Quest not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error updating quest" });
  }
};

// DELETE /quests/:id → Delete quest
export const deleteQuest = async (req, res) => {
  const { id } = req.params;

  const query = `
    DELETE FROM quests
    WHERE id = $1 AND user_id = $2
    RETURNING id;
  `;

  try {
    const result = await db.query(query, [id, req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Quest not found" });
    }
    res.json({ message: "Quest deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error deleting quest" });
  }
};

// Helper function
function getCurrentQuarter() {
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();
  const quarter = Math.ceil(month / 3);
  return `Q${quarter} ${year}`;
}
