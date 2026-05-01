const { Task, Project, User, sequelize } = require('../models');
const { Op } = require('sequelize');

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    // Get all project IDs the user has access to
    let projectIds = [];
    if (isAdmin) {
      const projects = await Project.findAll({ attributes: ['id'] });
      projectIds = projects.map(p => p.id);
    } else {
      const projects = await Project.findAll({
        attributes: ['id'],
        include: [{
          model: User,
          as: 'members',
          attributes: [],
          through: { attributes: [] },
          required: false
        }],
        where: {
          [Op.or]: [
            { ownerId: userId },
            { '$members.id$': userId }
          ]
        },
        subQuery: false
      });
      projectIds = projects.map(p => p.id);
    }

    const taskWhere = { projectId: { [Op.in]: projectIds } };

    // Query 1: Main Stats
    const totalTasks = await Task.count({ where: taskWhere });
    const todo = await Task.count({ where: { ...taskWhere, status: 'todo' } });
    const inProgress = await Task.count({ where: { ...taskWhere, status: 'in_progress' } });
    const done = await Task.count({ where: { ...taskWhere, status: 'done' } });
    
    const overdue = await Task.count({
      where: {
        ...taskWhere,
        dueDate: { [Op.lt]: new Date() },
        status: { [Op.ne]: 'done' }
      }
    });

    const myTasksCount = await Task.count({ 
      where: { 
        assigneeId: userId,
        projectId: { [Op.in]: projectIds } 
      } 
    });

    // Query 2: Weekly Activity
    // Since we want to be compatible with both Postgres and SQLite, we'll use Sequelize logic
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const weeklyTasks = await Task.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('updatedAt')), 'date'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN status = 'done' THEN 1 END")), 'completed'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'created']
      ],
      where: {
        ...taskWhere,
        updatedAt: { [Op.gte]: sevenDaysAgo }
      },
      group: [sequelize.fn('DATE', sequelize.col('updatedAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('updatedAt')), 'ASC']]
    });

    // Fill missing days
    const weeklyActivity = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      const dayData = weeklyTasks.find(t => t.dataValues.date === dateStr);
      weeklyActivity.push({
        day: dayName,
        completed: dayData ? parseInt(dayData.dataValues.completed) || 0 : 0,
        created: dayData ? parseInt(dayData.dataValues.created) || 0 : 0
      });
    }

    // Query 3: Priority Stats
    const priorities = await Task.findAll({
      attributes: [
        'priority',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        ...taskWhere,
        status: { [Op.ne]: 'done' }
      },
      group: ['priority']
    });

    const priorityStats = { high: 0, medium: 0, low: 0 };
    priorities.forEach(p => {
      priorityStats[p.priority] = parseInt(p.dataValues.count);
    });

    res.json({
      totalTasks,
      todo,
      inProgress,
      done,
      overdue,
      myTasks: myTasksCount,
      weeklyActivity,
      priorityStats
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };
