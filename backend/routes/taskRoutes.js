const express = require('express');
const router = express.Router();
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getMyTasks
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { isAdmin, isMember } = require('../middleware/role');

// Get all tasks assigned to the current user
router.get('/my-tasks', protect, getMyTasks);

// Get and create tasks for a project
router.route('/project/:id')
  .get(protect, isMember, getTasks)
  .post(protect, isAdmin, createTask);

// Update and delete specific tasks
router.route('/:id')
  .put(protect, updateTask) // Members can update status, Admin can update everything
  .delete(protect, isAdmin, deleteTask);

module.exports = router;
