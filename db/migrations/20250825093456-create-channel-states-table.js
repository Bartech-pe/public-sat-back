'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('channel_states', {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Identificador del estado del canal',
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Nombre del estado',
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Descripción del estado',
      },
      color: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Color de Estado',
      },
      category_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'ID del canal al que pertenece el estado',
      },
      inmutable: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Campo para habilitar o inhabilitar la edición de un registro',
      },
      status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
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

    // FK category_id -> category_channels.id
    await queryInterface.addConstraint('channel_states', {
      fields: ['category_id'],
      type: 'foreign key',
      name: 'fk_channel_states_category_id_category_channels',
      references: {
        table: 'category_channels',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK created_by -> users.id
    await queryInterface.addConstraint('channel_states', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_channel_states_created_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK updated_by -> users.id
    await queryInterface.addConstraint('channel_states', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_channel_states_updated_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK deleted_by -> users.id
    await queryInterface.addConstraint('channel_states', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_channel_states_deleted_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('channel_states');
  },
};
