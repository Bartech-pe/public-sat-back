'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'email_credentials',
      [
        {
          inbox_id: 2,
          email: 'demo.correo.sat@gmail.com',
          refresh_token:
            process.env.GOOGLE_REFRESH_TOKEN,
          client_id:
            process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          client_project: 'giusen-lab',
          client_topic: 'email-notifications',
          created_at: 1,
          updated_at: 1,
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
