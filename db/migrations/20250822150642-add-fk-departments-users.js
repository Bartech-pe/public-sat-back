'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // FK created_by -> users.id
    await queryInterface.addConstraint('departments', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_departments_created_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK updated_by -> users.id
    await queryInterface.addConstraint('departments', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_departments_updated_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK deleted_by -> users.id
    await queryInterface.addConstraint('departments', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_departments_deleted_by_users',
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
      'departments',
      'fk_departments_created_by_users',
    );
    await queryInterface.removeConstraint(
      'departments',
      'fk_departments_updated_by_users',
    );
    await queryInterface.removeConstraint(
      'departments',
      'fk_departments_deleted_by_users',
    );
  },
};
