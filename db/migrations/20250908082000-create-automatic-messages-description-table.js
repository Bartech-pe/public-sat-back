'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('automatic_message_descriptions', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Identificador único de la descripción de mensaje automático',
      },
      automatic_message_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'FK hacia el mensaje automático principal (automatic_messages)',
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Contenido o texto de la descripción',
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Orden de aparición de la descripción',
      },
      status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica si la descripción está activa o inactiva',
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
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Fecha de creación del registro',
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de última actualización del registro',
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de eliminación lógica del registro',
      },
    });

    /** -------------------------
     * Constraints (FKs)
     * ------------------------- */

    // automatic_message_id → automatic_messages.id
    await queryInterface.addConstraint('automatic_message_descriptions', {
      fields: ['automatic_message_id'],
      type: 'foreign key',
      name: 'fk_amd_automatic_message_id',
      references: {
        table: 'automatic_messages',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    // created_by → users.id
    await queryInterface.addConstraint('automatic_message_descriptions', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_amd_created_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // updated_by → users.id
    await queryInterface.addConstraint('automatic_message_descriptions', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_amd_updated_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // deleted_by → users.id
    await queryInterface.addConstraint('automatic_message_descriptions', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_amd_deleted_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    /** -------------------------
     * Índices para rendimiento
     * ------------------------- */
    await queryInterface.addIndex('automatic_message_descriptions', ['automatic_message_id']);
    await queryInterface.addIndex('automatic_message_descriptions', ['status']);
    await queryInterface.addIndex('automatic_message_descriptions', ['order']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('automatic_message_descriptions');
  },
};
