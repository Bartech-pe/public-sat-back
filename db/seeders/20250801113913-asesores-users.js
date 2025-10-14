'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'users',
      [
        {
          id: 3,
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
          id: 4,
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
          id: 5,
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
          id: 6,
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
          id: 7,
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
          id: 8,
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
        {
          id: 9,
          name: 'Erik Huaman Guiop',
          display_name: 'Erik Huaman',
          email: 'erik@mail.com',
          password:
            '$2b$10$Sn6yEoWy.h7OqtwaNMYVLOCwrsK5.wtHWm3ozBXNIx6G/6n9Mth5a',
          avatar_url: null,
          role_id: 3,
          office_id: 1,
          verified_email: false,
          status: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 10,
          name: 'Alexis Orlando Galindez Palencia',
          display_name: 'Alexis Galindez',
          email: 'alexis@mail.com',
          password:
            '$2b$10$Sn6yEoWy.h7OqtwaNMYVLOCwrsK5.wtHWm3ozBXNIx6G/6n9Mth5a',
          avatar_url: null,
          role_id: 3,
          office_id: 1,
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
