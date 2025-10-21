'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('channel_query_history', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Identificador del registro de consulta',
      },
      channel_attention_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'FK hacia la atención en curso (channel_attentions)',
      },
      query_type: {
        type: Sequelize.ENUM(
          'tickets_by_plate',
          'tickets_by_dni',
          'tickets_by_ruc',
          'infraction_code',
          'taxes_by_plate',
          'taxes_by_dni',
          'taxes_by_ruc',
          'taxes_by_taxpayer_code',
          'capture_order_by_plate',
          'procedure_by_number'
        ),
        allowNull: false,
        comment: 'Tipo de consulta realizada',
      },
      document_type: {
        type: Sequelize.ENUM(
          'plate',
          'dni',
          'ruc',
          'infraction_code',
          'taxpayer_code',
          'procedure_number'
        ),
        allowNull: false,
        comment: 'Tipo de documento utilizado en la consulta',
      },
      document_value: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Valor del documento ingresado',
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

    // channel_attention_id → channel_attentions.id
    await queryInterface.addConstraint('channel_query_history', {
      fields: ['channel_attention_id'],
      type: 'foreign key',
      name: 'fk_channel_query_history_attention_id',
      references: {
        table: 'channel_attentions',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // created_by → users.id
    await queryInterface.addConstraint('channel_query_history', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_channel_query_history_created_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // updated_by → users.id
    await queryInterface.addConstraint('channel_query_history', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_channel_query_history_updated_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // deleted_by → users.id
    await queryInterface.addConstraint('channel_query_history', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_channel_query_history_deleted_by',
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
    await queryInterface.dropTable('channel_query_history');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_channel_query_history_query_type";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_channel_query_history_document_type";'
    );
  },
};
