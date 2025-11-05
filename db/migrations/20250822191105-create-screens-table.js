'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('screens', {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Identificador de la pantalla',
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Nombre de la pantalla',
      },
      description: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
        comment: 'Descripción de la pantalla',
      },
      path: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Ruta de la pantalla',
      },
      icon: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Icono de la pantalla',
      },
      parent_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        comment: 'Id de la pantalla padre',
      },
      status: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: 'Campo para habilitar o inhabilitar un registro',
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

    /** -------------------------
     * Constraints nombrados
     * ------------------------- */

    // FK parent_id -> screens.id
    await queryInterface.addConstraint('screens', {
      fields: ['parent_id'],
      type: 'foreign key',
      name: 'fk_screens_parent_id_screens',
      references: {
        table: 'screens',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK created_by -> users.id
    await queryInterface.addConstraint('screens', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_screens_created_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK updated_by -> users.id
    await queryInterface.addConstraint('screens', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_screens_updated_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK deleted_by -> users.id
    await queryInterface.addConstraint('screens', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_screens_deleted_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('screens');
  },
};
