import express from 'express';
import { 
  createQuest, 
  getQuests, 
  updateQuest, 
  deleteQuest 
} from '../controllers/questsController.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = express.Router();

router.post('/', authenticate, createQuest);
router.get('/', authenticate, getQuests);
router.put('/:id', authenticate, updateQuest);
router.delete('/:id', authenticate, deleteQuest);

export default router;