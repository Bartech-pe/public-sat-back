'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'inboxes',
      [
        {
          id: 1,
          name: 'SAT - Whatsapp',
          avatar_url: null,
          widget_color: null,
          channel_id: 2,
          status: true,
          created_at: 1,
          updated_at: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
        // {
        //   id: 2,
        //   name: 'SAT - Mail',
        //   avatar_url: null,
        //   widget_color: null,
        //   channel_id: 4,
        //   status: true,
        //   created_at: 1,
        //   updated_at: 1,
        //   created_at: new Date(),
        //   updated_at: new Date(),
        // },
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
