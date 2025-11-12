'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'type_contacts',
      [
        {
          id: 1,
          name: 'Teléfono',
          code: 'PHONE',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 2,
          name: 'Correo electrónico',
          code: 'EMAIL',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 3,
          name: 'Whatsapp',
          code: 'WHATSAPP',
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
