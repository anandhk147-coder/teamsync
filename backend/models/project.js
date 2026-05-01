'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Project extends Model {
    static associate(models) {
      Project.belongsTo(models.User, { foreignKey: 'ownerId', as: 'owner' });
      Project.belongsToMany(models.User, { 
        through: models.Member,
        foreignKey: 'projectId',
        as: 'members',
        onDelete: 'CASCADE'
      });
      Project.hasMany(models.Task, { foreignKey: 'projectId', as: 'tasks', onDelete: 'CASCADE' });
    }
  }
  Project.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    status: {
      type: DataTypes.ENUM('active', 'completed', 'on_hold'),
      defaultValue: 'active'
    },
    deadline: {
      type: DataTypes.DATE
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Project',
  });
  return Project;
};
