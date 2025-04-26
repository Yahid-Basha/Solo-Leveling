import express from 'express';
import { 
  createTask, 
  getTasks, 
  updateTask,
  verifyTask,
  retryTask,
  deleteTask
} from '../controllers/tasksController.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = express.Router();

router.post('/', authenticate, createTask);
router.get('/', authenticate, getTasks);
router.put('/:id', authenticate, updateTask);
router.post('/:id/verify', authenticate, verifyTask);
router.post('/:id/retry', authenticate, retryTask);
router.delete('/:id', authenticate, deleteTask);

export default router;