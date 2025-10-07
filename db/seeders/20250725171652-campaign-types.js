'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'campaign_types',
      [
        {
          id: 1,
          name: 'SMS',
          status: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 2,
          name: 'Correo',
          status: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 3,
          name: 'Audio',
          status: true,
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
