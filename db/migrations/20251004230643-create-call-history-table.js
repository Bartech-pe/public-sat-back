'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('call_history', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Identificador del recordatorio',
      },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        comment: 'Id del usuario',
      },
      lead_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      unique_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      caller_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      user_code: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      phone_number: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      channel: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      entry_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      seconds: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      call_status: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      call_basic_info: {
        type: Sequelize.TEXT,
        allowNull: true,
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

    // Relación con users (created_by)
    await queryInterface.addConstraint('call_history', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_call_history_created_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // Relación con users (updated_by)
    await queryInterface.addConstraint('call_history', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_call_history_updated_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // Relación con users (deleted_by)
    await queryInterface.addConstraint('call_history', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_call_history_deleted_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('call_history');
  },
};
