'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('campaign_schedules', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Identificador único del horario de la campaña',
      },
      interval_days: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          is: /^[0-6]-[0-6]$/, // ejemplo: 0-6, 1-5, 2-4
        },
        comment: 'Intervalo de días en formato 0-6',
      },
      start_time: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          is: /^([01]\d|2[0-3]):([0-5]\d)$/, // valida formato HH:mm
        },
        comment: 'Hora de inicio HH:mm',
      },
      end_time: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          is: /^([01]\d|2[0-3]):([0-5]\d)$/, // valida formato HH:mm
        },
        comment: 'Hora de fin HH:mm',
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

    // created_by → users.id
    await queryInterface.addConstraint('campaign_schedules', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_campaign_schedules_created_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // updated_by → users.id
    await queryInterface.addConstraint('campaign_schedules', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_campaign_schedules_updated_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // deleted_by → users.id
    await queryInterface.addConstraint('campaign_schedules', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_campaign_schedules_deleted_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('campaign_schedules');
  },
};
