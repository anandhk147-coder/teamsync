const { Task, Project, User } = require('../models');

const getTasks = async (req, res) => {
  const { status, assignee, priority, page = 1, limit = 10 } = req.query;
  const where = { projectId: req.params.id };

  if (status) where.status = status;
  if (assignee) where.assigneeId = assignee;
  if (priority) where.priority = priority;

  const offset = (page - 1) * limit;

  try {
    const { count, rows } = await Task.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [{ model: User, as: 'assignee', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      tasks: rows,
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTask = async (req, res) => {
  const { title, description, assigneeId, status, priority, dueDate } = req.body;
  const projectId = req.params.id;

  try {
    // Validation: dueDate must be future
    if (dueDate && new Date(dueDate) < new Date()) {
      return res.status(400).json({ message: 'Due date must be in the future' });
    }

    const task = await Task.create({
      title,
      description,
      projectId,
      assigneeId,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Members can only update status
    if (req.user.role === 'member') {
      const { status } = req.body;
      await task.update({ status });
    } else {
      await task.update(req.body);
    }

    res.json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    await task.destroy();
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyTasks = async (req, res) => {
  const { status, priority, page = 1, limit = 10 } = req.query;
  const where = { assigneeId: req.user.id };

  if (status) where.status = status;
  if (priority) where.priority = priority;

  const offset = (page - 1) * limit;

  try {
    const { count, rows } = await Task.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      tasks: rows,
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getMyTasks
};
