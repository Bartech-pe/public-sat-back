'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('email_threads', 'to_name', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Nombre del destinatario',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('email_threads', 'to_name');
  },
};
