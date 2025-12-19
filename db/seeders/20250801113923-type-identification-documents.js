'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'type_identification_documents',
      [
        {
          id: 1,
          name: 'DNI/LE',
          code: 'DNI/LE',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 2,
          name: 'RUC',
          code: 'RUC',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 3,
          name: 'PASAPORTE',
          code: 'PASAPORTE',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
