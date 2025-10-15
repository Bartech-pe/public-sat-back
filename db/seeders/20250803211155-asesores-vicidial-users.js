'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'vicidial_users',
      [
        {
          id: 1,
          username: 'erikmailcom',
          user_password: 'qsawd2132',
          phone_login: '2000',
          phone_password: 'qsawd2132',
          user_level: 9,
          user_group: 'ADMIN',
          user_id: 9,
          channel_state_id: 16,
          created_by: 1,
          updated_by: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 2,
          username: 'alexismailcom',
          user_password: 'qsawd2132',
          phone_login: '2001',
          phone_password: 'qsawd2132',
          user_level: 9,
          user_group: 'ADMIN',
          user_id: 10,
          channel_state_id: 16,
          created_by: 1,
          updated_by: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    queryInterface.bulkDelete('vicidial_users', null, {});
  },
};
