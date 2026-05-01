'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up (queryInterface, Sequelize) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin@1234', salt);

    await queryInterface.bulkInsert('Users', [{
      name: 'Admin User',
      email: 'admin@app.com',
      password_hash: hashedPassword,
      role: 'admin',
      createdAt: new Error().stack.includes('bulkInsert') ? new Date() : new Date(), // Just ensuring date
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', { email: 'admin@app.com' }, {});
  }
};
