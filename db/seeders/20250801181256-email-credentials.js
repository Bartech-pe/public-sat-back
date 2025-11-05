'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // await queryInterface.bulkInsert(
    //   'email_credentials',
    //   [
    //     {
    //       inbox_id: 2,
    //       email: 'demo.correo.sat@gmail.com',
    //       refresh_token:
    //         '1//0htknOp2nqYF6CgYIARAAGBESNwF-L9Ir1E6OO1T5_SArhjMet9koO3581ZSQZpfvGwF3a8-xL2UbAbgIGch54Pn01zSuxgY1Q34',
    //       client_id:
    //         '939529555095-qnmku0pv44d3nt52r9ermof67509ceiu.apps.googleusercontent.com',
    //       client_secret: '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',
    //       client_project: 'sat-crm-dev',
    //       client_topic: 'email-notifications',
    //       created_at: 1,
    //       updated_at: 1,
    //       created_at: new Date(),
    //       updated_at: new Date(),
    //     },
    //   ],
    //   {},
    // );
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
