'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('vicidial_users', 'conf_exten', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'conf_exten',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('vicidial_users', 'conf_exten');
  },
};
