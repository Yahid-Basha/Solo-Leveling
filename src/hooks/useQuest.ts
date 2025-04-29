import { useContext } from "react";
import { QuestContext } from "../context/QuestContext";

export const useQuests = () => useContext(QuestContext);
