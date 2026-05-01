const { Project, Member } = require('../models');

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

const isProjectAdmin = async (req, res, next) => {
  const projectId = req.params.id || req.body.projectId;
  const project = await Project.findByPk(projectId);
  
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  // Check if owner or member with admin role
  console.log(`Checking project admin for user ${req.user.id} on project ${projectId}`);
  if (project.ownerId === req.user.id || req.user.role === 'admin') {
    console.log('User is owner or admin');
    return next();
  }

  const member = await Member.findOne({
    where: { projectId, userId: req.user.id }
  });

  if (member && member.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized to manage this project' });
  }
};

const isMember = async (req, res, next) => {
  const projectId = req.params.id || req.body.projectId;
  const project = await Project.findByPk(projectId);

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  if (project.ownerId === req.user.id || req.user.role === 'admin') {
    return next();
  }

  const member = await Member.findOne({
    where: { projectId, userId: req.user.id }
  });

  if (member) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized, you are not a member of this project' });
  }
};

module.exports = { isAdmin, isProjectAdmin, isMember };
