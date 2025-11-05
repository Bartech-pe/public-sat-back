'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'quick-response-category',
      [
        {
          quickResponseCategoryId: 1,
          name: 'Servicios Digitales',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          quickResponseCategoryId: 2,
          name: 'Trámites Tributarios',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          quickResponseCategoryId: 3,
          name: 'Pagos y Facturación',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
         {
          quickResponseCategoryId: 4,
          name: 'Procesos Legales',
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
