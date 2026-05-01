const { Project, User, Member, Task } = require('../models');
const { Op } = require('sequelize');

const getProjects = async (req, res) => {
  try {
    let projects;
    const includeOptions = [
      { model: User, as: 'owner', attributes: ['name', 'email'] },
      { model: User, as: 'members', attributes: ['id', 'name'], through: { attributes: [] } },
      { model: Task, as: 'tasks', attributes: ['id', 'status'] }
    ];

    if (req.user.role === 'admin') {
      projects = await Project.findAll({ include: includeOptions });
    } else {
      projects = await Project.findAll({
        include: includeOptions,
        where: {
          [Op.or]: [
            { ownerId: req.user.id },
            { '$members.id$': req.user.id }
          ]
        },
        subQuery: false 
      });
    }
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProject = async (req, res) => {
  const { name, description, deadline, status, members } = req.body;
  try {
    const project = await Project.create({
      name,
      description,
      deadline,
      status: status || 'active',
      ownerId: req.user.id
    });

    if (members && members.length > 0) {
      const memberData = members.map(userId => ({
        projectId: project.id,
        userId,
        role: 'member'
      }));
      await Member.bulkCreate(memberData);
    }

    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'members', attributes: ['id', 'name', 'email', 'role'], through: { attributes: ['role'] } },
        { model: Task, as: 'tasks' }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    await project.update(req.body);
    res.json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Manually delete tasks and members to avoid foreign key constraint errors
    await Task.destroy({ where: { projectId: project.id } });
    await Member.destroy({ where: { projectId: project.id } });

    await project.destroy();
    res.json({ message: 'Project removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addMember = async (req, res) => {
  const { userId, role } = req.body;
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    await Member.create({
      projectId: project.id,
      userId,
      role: role || 'member'
    });

    res.status(201).json({ message: 'Member added' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const removeMember = async (req, res) => {
  try {
    const member = await Member.findOne({
      where: { projectId: req.params.id, userId: req.params.uid }
    });

    if (!member) return res.status(404).json({ message: 'Member not found' });

    await member.destroy();
    res.json({ message: 'Member removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember
};
