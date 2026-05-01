const express = require('express');
const router = express.Router();
const {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const { isAdmin, isProjectAdmin, isMember } = require('../middleware/role');

router.route('/')
  .get(protect, getProjects)
  .post(protect, isAdmin, createProject);

router.route('/:id')
  .get(protect, isMember, getProjectById)
  .put(protect, isProjectAdmin, updateProject)
  .delete(protect, isProjectAdmin, deleteProject);

router.post('/:id/members', protect, isProjectAdmin, addMember);
router.delete('/:id/members/:uid', protect, isProjectAdmin, removeMember);

module.exports = router;
