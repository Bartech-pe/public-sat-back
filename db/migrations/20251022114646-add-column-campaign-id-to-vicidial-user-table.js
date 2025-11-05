'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('vicidial_users', 'campaign_id', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Id de la campaña',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('vicidial_users', 'campaign_id');
  },
};
