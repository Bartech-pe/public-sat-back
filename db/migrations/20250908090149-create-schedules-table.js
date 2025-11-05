'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('schedules', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Identificador del horario',
      },
      start_time: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Hora de inicio del horario',
      },
      end_time: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Hora de fin del horario',
      },
      is_holiday: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        comment: 'Indica si el día es feriado',
      },
      campaign_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        comment: 'ID de la campaña asociada (opcional)',
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

    // campaign_id → campaigns.id
    await queryInterface.addConstraint('schedules', {
      fields: ['campaign_id'],
      type: 'foreign key',
      name: 'fk_schedules_campaign_id',
      references: {
        table: 'campaigns',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // si se elimina la campaña, se mantiene el horario sin asociación
    });

    // created_by → users.id
    await queryInterface.addConstraint('schedules', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_schedules_created_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // updated_by → users.id
    await queryInterface.addConstraint('schedules', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_schedules_updated_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // deleted_by → users.id
    await queryInterface.addConstraint('schedules', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_schedules_deleted_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('schedules');
  },
};
