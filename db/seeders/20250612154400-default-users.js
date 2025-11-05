'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'users',
      [
        {
          id: 1,
          name: 'Administrador',
          display_name: 'Administrador',
          email: 'admin@mail.com',
          password:
            '$2b$10$Sn6yEoWy.h7OqtwaNMYVLOCwrsK5.wtHWm3ozBXNIx6G/6n9Mth5a',
          avatar_url: null,
          role_id: 1,
          verified_email: false,
          status: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 2,
          name: 'Rasa Bot',
          display_name: 'Rasa Bot',
          email: 'rasa-bot@mail.com',
          password:
            '$2b$10$HhL6pyJunyPeGS4NIIp3HeXaKOiILZ54PugQJqO0ZRdMVax6ag/9.',
          avatar_url: null,
          role_id: 1,
          verified_email: false,
          status: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    queryInterface.bulkDelete('users', null, {});
  },
};
