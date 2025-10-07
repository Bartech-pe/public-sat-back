'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Elimina el constraint único de la columna email
    await queryInterface.removeConstraint('users', 'uq_users_email');
  },

  async down(queryInterface, Sequelize) {
    // Lo vuelve a crear en caso de rollback
    await queryInterface.addConstraint('users', {
      fields: ['email'],
      type: 'unique',
      name: 'uq_users_email',
    });
  },
};
