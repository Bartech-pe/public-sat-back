'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('vicidial_users', 'inbound_groups', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Inbound groups asignados',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('vicidial_users', 'inbound_groups');
  },
};
