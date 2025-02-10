const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Operation extends Model {}

Operation.init(
  {
    recipe: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  },
  {
    sequelize,
    modelName: 'operation',
  }
);
