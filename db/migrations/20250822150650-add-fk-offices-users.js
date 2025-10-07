'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // FK created_by -> users.id
    await queryInterface.addConstraint('offices', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_offices_created_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK updated_by -> users.id
    await queryInterface.addConstraint('offices', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_offices_updated_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK deleted_by -> users.id
    await queryInterface.addConstraint('offices', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_offices_deleted_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      'offices',
      'fk_offices_created_by_users',
    );
    await queryInterface.removeConstraint(
      'offices',
      'fk_offices_updated_by_users',
    );
    await queryInterface.removeConstraint(
      'offices',
      'fk_offices_deleted_by_users',
    );
  },
};
