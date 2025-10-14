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
            '1//061hqNKWR4DJUCgYIARAAGAYSNwF-L9IrWovZoXeHNP2KLchdlAbZUF7ByIkYhHD3ytVbXkng48Os1WDVKJwI1MIv6JiI3164CUI',
          client_id:
            '704373357101-c9p6e5jb86ar9co0c36t7j3ahf2mdav6.apps.googleusercontent.com',
          client_secret: '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',
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
