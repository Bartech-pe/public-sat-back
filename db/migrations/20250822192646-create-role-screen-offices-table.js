'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('role_screen_offices', {
      role_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'Id del rol',
      },
      screen_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'Id de la pantalla',
      },
      office_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'Id de la oficna',
      },
      can_read: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment:
          'Campo para habilitar o inhabilitar la visualización de la pantalla',
      },
      can_create: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment:
          'Campo para habilitar o inhabilitar la creación de la pantalla',
      },
      can_update: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment:
          'Campo para habilitar o inhabilitar la actualización de la pantalla',
      },
      can_delete: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment:
          'Campo para habilitar o inhabilitar la eliminación de la pantalla',
      },

      // Auditoría con FK hacia users
      created_by: {
        type: Sequelize.BIGINT,
        allowNull: true,
        comment: 'Usuario que creó el registro',
      },
      updated_by: {
        type: Sequelize.BIGINT,
        allowNull: true,
        comment: 'Usuario que actualizó el registro',
      },
      deleted_by: {
        type: Sequelize.BIGINT,
        allowNull: true,
        comment: 'Usuario que eliminó el registro',
      },

      // Timestamps
      created_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de creación',
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de última actualización',
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de eliminación lógica',
      },
    });

    // PRIMARY KEY compuesta (role_id + screen_id)
    await queryInterface.addConstraint('role_screen_offices', {
      fields: ['role_id', 'screen_id', 'office_id'],
      type: 'primary key',
      name: 'pk_role_screen_offices',
    });

    // // UNIQUE constraint explícita
    // await queryInterface.addConstraint('role_screen_offices', {
    //   fields: ['screen_id', 'role_id'],
    //   type: 'unique',
    //   name: 'uq_role_screen_offices_screen_id_role_id',
    // });

    /* // FK role_id -> roles.id
    await queryInterface.addConstraint('role_screen_offices', {
      fields: ['role_id'],
      type: 'foreign key',
      name: 'fk_role_screen_offices_role_id_roles',
      references: {
        table: 'roles',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK screen_id -> screens.id
    await queryInterface.addConstraint('role_screen_offices', {
      fields: ['screen_id'],
      type: 'foreign key',
      name: 'fk_role_screen_offices_screen_id_screens',
      references: {
        table: 'screens',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    }); */

    // FK created_by -> users.id
    await queryInterface.addConstraint('role_screen_offices', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_role_screen_offices_created_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK updated_by -> users.id
    await queryInterface.addConstraint('role_screen_offices', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_role_screen_offices_updated_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK deleted_by -> users.id
    await queryInterface.addConstraint('role_screen_offices', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_role_screen_offices_deleted_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('role_screen_offices');
  },
};
