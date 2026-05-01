'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Task extends Model {
    static associate(models) {
      Task.belongsTo(models.Project, { foreignKey: 'projectId', as: 'project' });
      Task.belongsTo(models.User, { foreignKey: 'assigneeId', as: 'assignee' });
    }
  }
  Task.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    assigneeId: {
      type: DataTypes.INTEGER
    },
    status: {
      type: DataTypes.ENUM('todo', 'in_progress', 'done'),
      defaultValue: 'todo'
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      defaultValue: 'medium'
    },
    dueDate: {
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'Task',
  });
  return Task;
};
