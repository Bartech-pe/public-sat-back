'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('vicidial_users', 'session_name', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Nombre de la sesión',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('vicidial_users', 'session_name');
  },
};
