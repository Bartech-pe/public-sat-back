'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('email_threads', 'name', {
      type: Sequelize.STRING,
      allowNull: null,
      comment: 'Nombre del remitente',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('email_threads', 'name');
  },
};
