'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notifications', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID de la notificación',
      },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'ID del usuario que recibe la notificación',
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Mensaje de la notificación',
      },
      is_read: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Indica si la notificación ha sido leída',
      },
      status: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: 'Campo para habilitar o inhabilitar un registro',
      },

      // Auditoría
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
     * Constraints (FKs)
     * ------------------------- */

    // FK hacia users (usuario que recibe la notificación)
    await queryInterface.addConstraint('notifications', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_notifications_user',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK hacia users (created_by)
    await queryInterface.addConstraint('notifications', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_notifications_created_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK hacia users (updated_by)
    await queryInterface.addConstraint('notifications', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_notifications_updated_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK hacia users (deleted_by)
    await queryInterface.addConstraint('notifications', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_notifications_deleted_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('notifications');
  },
};
