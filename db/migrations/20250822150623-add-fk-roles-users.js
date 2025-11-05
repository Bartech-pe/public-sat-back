'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // FK created_by -> users.id
    await queryInterface.addConstraint('roles', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_roles_created_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK updated_by -> users.id
    await queryInterface.addConstraint('roles', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_roles_updated_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK deleted_by -> users.id
    await queryInterface.addConstraint('roles', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_roles_deleted_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('roles', 'fk_roles_created_by_users');
    await queryInterface.removeConstraint('roles', 'fk_roles_updated_by_users');
    await queryInterface.removeConstraint('roles', 'fk_roles_deleted_by_users');
  },
};
