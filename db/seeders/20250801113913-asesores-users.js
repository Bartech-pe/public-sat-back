'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'users',
      [
        {
          name: 'Cesar Huaman',
          display_name: 'Cesar Huaman',
          email: 'cesar@mail.com',
          password:
            '$2b$10$Sn6yEoWy.h7OqtwaNMYVLOCwrsK5.wtHWm3ozBXNIx6G/6n9Mth5a',
          avatar_url: null,
          role_id: 3,
          office_id: 2,
          verified_email: false,
          status: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'Fabian Melgar',
          display_name: 'Fabian Melgar',
          email: 'fabian@mail.com',
          password:
            '$2b$10$Sn6yEoWy.h7OqtwaNMYVLOCwrsK5.wtHWm3ozBXNIx6G/6n9Mth5a',
          avatar_url: null,
          role_id: 3,
          office_id: 2,
          verified_email: false,
          status: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'Ana Vernazza',
          display_name: 'Ana Vernazza',
          email: 'ana@mail.com',
          password:
            '$2b$10$Sn6yEoWy.h7OqtwaNMYVLOCwrsK5.wtHWm3ozBXNIx6G/6n9Mth5a',
          avatar_url: null,
          role_id: 3,
          office_id: 2,
          verified_email: false,
          status: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'Milagros Tirado',
          display_name: 'Milagros Tirado',
          email: 'milagros@mail.com',
          password:
            '$2b$10$Sn6yEoWy.h7OqtwaNMYVLOCwrsK5.wtHWm3ozBXNIx6G/6n9Mth5a',
          avatar_url: null,
          role_id: 3,
          office_id: 2,
          verified_email: false,
          status: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'Roberto Cornejo',
          display_name: 'Roberto Cornejo',
          email: 'roberto@mail.com',
          password:
            '$2b$10$Sn6yEoWy.h7OqtwaNMYVLOCwrsK5.wtHWm3ozBXNIx6G/6n9Mth5a',
          avatar_url: null,
          role_id: 3,
          office_id: 2,
          verified_email: false,
          status: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'Faraw Reyes',
          display_name: 'Faraw Reyes',
          email: 'faraw@mail.com',
          password:
            '$2b$10$Sn6yEoWy.h7OqtwaNMYVLOCwrsK5.wtHWm3ozBXNIx6G/6n9Mth5a',
          avatar_url: null,
          role_id: 3,
          office_id: 2,
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
