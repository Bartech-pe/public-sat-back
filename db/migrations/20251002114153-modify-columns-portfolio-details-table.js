'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn(
      'portfolio_details',
      'pay',
      'current_debt',
    );

    await queryInterface.changeColumn('portfolio_details', 'current_debt', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.0,
      comment: 'Deuda actual del contribuyente (ciudadano)',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn(
      'portfolio_details',
      'current_debt',
      'pay',
    );

    await queryInterface.changeColumn('portfolio_details', 'pay', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: null,
      comment: 'Pago de la deuda del contribuyente (ciudadano)',
    });
  },
};
