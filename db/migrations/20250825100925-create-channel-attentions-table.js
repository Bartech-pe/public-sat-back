'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('channel_attentions', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Identificador único de la attención',
      },
      channel_room_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'FK hacia la sala de conversación (channel_rooms)',
      },
      consult_type_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        comment: 'FK hacia el tipo de consulta (consult_types)',
      },
      attention_detail: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Detalle de atención',
      },
      status: {
        type: Sequelize.ENUM('identity_verification', 'in_progress', 'closed'),
        allowNull: false,
        defaultValue: 'identity_verification',
        comment: 'Estado de la attención',
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Fecha de inicio de la attención',
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de finalización de la attención (si aplica)',
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
        comment: 'Fecha de creación del registro',
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

    // channel_room_id → channel_rooms.id
    await queryInterface.addConstraint('channel_attentions', {
      fields: ['channel_room_id'],
      type: 'foreign key',
      name: 'fk_channel_attentions_channel_room_id',
      references: {
        table: 'channel_rooms',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    await queryInterface.addConstraint('channel_attentions', {
      fields: ['consult_type_id'],
      type: 'foreign key',
      name: 'fk_channel_attentions_consult_type_id',
      references: {
        table: 'consult_types',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // created_by → users.id
    await queryInterface.addConstraint('channel_attentions', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_channel_attentions_created_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // updated_by → users.id
    await queryInterface.addConstraint('channel_attentions', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_channel_attentions_updated_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // deleted_by → users.id
    await queryInterface.addConstraint('channel_attentions', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_channel_attentions_deleted_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface, Sequelize) {
    // Eliminamos la tabla y ENUMs asociados
    await queryInterface.dropTable('channel_attentions');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_channel_attentions_state";',
    );
  },
};
