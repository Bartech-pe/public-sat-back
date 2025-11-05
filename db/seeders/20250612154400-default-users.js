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
          displayName: 'Administrador',
          email: 'admin@mail.com',
          password:
            '$2b$10$Sn6yEoWy.h7OqtwaNMYVLOCwrsK5.wtHWm3ozBXNIx6G/6n9Mth5a',
          avatarUrl:
            'https://png.pngtree.com/png-vector/20220709/ourmid/pngtree-businessman-user-avatar-wearing-suit-with-red-tie-png-image_5809521.png',
          idRole: 1,
          verified: false,
          status: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
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
