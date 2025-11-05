'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'area-campania',
      [
        {
          id: 1,
          name: 'Subgerencia de Gestión de Cobranza - Tributaria',
          status: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Subgerencia de Gestión de Cobranza - No Tributaria',
          status: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          name: 'Subgerencia de Gestión de Coactiva - Tributaria',
          status: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
         {
          id: 4,
          name: 'Subgerencia de Gestión de Coactiva - No Tributaria',
          status: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {},
    );
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
