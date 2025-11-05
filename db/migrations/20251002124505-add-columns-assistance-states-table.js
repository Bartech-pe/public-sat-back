'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('assistance_states', 'icon', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'oui:dot',
      comment: 'Icono de estado de atención',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('assistance_states', 'icon');
  },
};
