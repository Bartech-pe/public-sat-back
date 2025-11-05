'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('calls', {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Identificador de la llamada',
      },
      duration: {
        type: Sequelize.FLOAT,
        allowNull: false,
        comment: 'Duración de la llamada',
      },
      recording: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Grabación de la llamada',
      },
      phone_number: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Número de la llamada entrante',
      },
      channel: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Canal de la llamada entrante',
      },
      call_state_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'ID del estado de la llamada',
      },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'ID del usuario (asesor)',
      },
      status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
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

    // call_state_id -> call_states.id
    await queryInterface.addConstraint('calls', {
      fields: ['call_state_id'],
      type: 'foreign key',
      name: 'fk_calls_call_state_id_call_states',
      references: {
        table: 'call_states',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // user_id -> users.id
    await queryInterface.addConstraint('calls', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_calls_user_id_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // Auditoría
    await queryInterface.addConstraint('calls', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_calls_created_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    await queryInterface.addConstraint('calls', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_calls_updated_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    await queryInterface.addConstraint('calls', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_calls_deleted_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('calls');
  },
};
