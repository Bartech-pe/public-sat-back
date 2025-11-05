'use strict';

const { CreatedAt } = require('sequelize-typescript');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('email_states', [
      {
        id: 1,
        name: 'Send',
        code: '01',
        icon: 'mdi:inbox',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        name: 'Draft',
        code: '02',
        icon: 'mdi:file-o',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 3,
        name: 'Trash',
        code: '03',
        icon: 'mdi:trash',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 4,
        name: 'Spam',
        code: '04',
        icon: 'mdi:trash',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 5,
        name: 'Reply',
        code: '05',
        icon: 'mdi:trash',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 6,
        name: 'Forward',
        code: '06',
        icon: 'mdi:trash',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
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
