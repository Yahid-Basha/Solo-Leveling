import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import questsRoutes from "./routes/quests.js";
import tasksRoutes from "./routes/tasks.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/quests", questsRoutes);
app.use("/tasks", tasksRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.get("/ping", (_, res) => {
  res.send("pong");
});

// Keep server awake by pinging itself every 5 minutes
setInterval(
  () => {
    fetch(`http://localhost:${PORT}/ping`).catch(() => {});
  },
  5 * 60 * 1000
);
