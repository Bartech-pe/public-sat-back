'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'category_channels',
      [
        {
          id: 1,
          name: 'Telefónico',
          icon: 'line-md:phone-call-loop',
          status: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 2,
          name: 'Email',
          icon: 'line-md:email',
          status: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 3,
          name: 'ChatSAT',
          icon: 'line-md:chat',
          status: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 4,
          name: 'WhatsApp',
          icon: 'ic:outline-whatsapp',
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
