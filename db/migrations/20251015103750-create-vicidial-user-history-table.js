'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('vicidial_user_history', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        comment:
          'Identificador único del registro histórico del usuario Vicidial',
      },
      vicidial_user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'Referencia al usuario Vicidial afectado',
      },
      old_channel_state_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'Estado de canal anterior del usuario',
      },
      new_channel_state_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'Nuevo estado de canal asignado al usuario',
      },
      old_pause_code: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Código de pausa anterior del agente (si existía)',
      },
      new_pause_code: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Nuevo código de pausa asignado al agente (si aplica)',
      },
      start_time: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha y hora en que comenzó el estado anterior',
      },
      end_time: {
        type: Sequelize.DATE,
        allowNull: true,
        comment:
          'Fecha y hora en que terminó el estado anterior o inició el nuevo',
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Duración total (en segundos) del estado anterior',
      },
    });

    /** -------------------------
     * Constraints (FKs)
     * ------------------------- */

    // FK vicidial_user_id -> vicidial_users.id
    await queryInterface.addConstraint('vicidial_user_history', {
      fields: ['vicidial_user_id'],
      type: 'foreign key',
      name: 'fk_vicidial_user_history_vicidial_user_id_vicidial_users',
      references: {
        table: 'vicidial_users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK old_channel_state_id -> channel_states.id
    await queryInterface.addConstraint('vicidial_user_history', {
      fields: ['old_channel_state_id'],
      type: 'foreign key',
      name: 'fk_vicidial_user_history_old_channel_state_id_channel_states',
      references: {
        table: 'channel_states',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK new_channel_state_id -> channel_states.id
    await queryInterface.addConstraint('vicidial_user_history', {
      fields: ['new_channel_state_id'],
      type: 'foreign key',
      name: 'fk_vicidial_user_history_new_channel_state_id_channel_states',
      references: {
        table: 'channel_states',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('vicidial_user_history');
  },
};
