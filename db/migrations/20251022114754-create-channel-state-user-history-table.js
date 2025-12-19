'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('channel_state_user_history', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        comment:
          'Identificador único del registro histórico de estado de canal de usuario',
      },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'Referencia al usuario',
      },
      inbox_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'Referencia a la bandeja de entrada',
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

    // FK user_id -> users.id
    await queryInterface.addConstraint('channel_state_user_history', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_channel_state_history_user_id_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK inbox_id -> inboxes.id
    await queryInterface.addConstraint('channel_state_user_history', {
      fields: ['inbox_id'],
      type: 'foreign key',
      name: 'fk_channel_state_history_inbox_id_inboxes',
      references: {
        table: 'inboxes',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK old_channel_state_id -> channel_states.id
    await queryInterface.addConstraint('channel_state_user_history', {
      fields: ['old_channel_state_id'],
      type: 'foreign key',
      name: 'fk_channel_state_history_old_channel_state_id_channel_states',
      references: {
        table: 'channel_states',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK new_channel_state_id -> channel_states.id
    await queryInterface.addConstraint('channel_state_user_history', {
      fields: ['new_channel_state_id'],
      type: 'foreign key',
      name: 'fk_channel_state_history_new_channel_state_id_channel_states',
      references: {
        table: 'channel_states',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('channel_state_user_history');
  },
};
