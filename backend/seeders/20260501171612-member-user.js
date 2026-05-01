'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up (queryInterface, Sequelize) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Member@1234', salt);

    await queryInterface.bulkInsert('Users', [{
      name: 'Test Member',
      email: 'member@test.com',
      password_hash: hashedPassword,
      role: 'member',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', { email: 'member@test.com' }, {});
  }
};
