'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('channel_messages', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Identificador único del mensaje en el canal',
      },
      channel_room_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'ID de la sala de conversación (ChannelRoom)',
      },
      channel_attention_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'ID de la asistencia vinculada',
      },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'ID del usuario que envía el mensaje',
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Contenido del mensaje',
      },
      external_message_id: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'ID externo del mensaje (ejemplo: WhatsApp, Telegram, etc.)',
      },
      sender_type: {
        type: Sequelize.ENUM('agent', 'citizen', 'bot'),
        allowNull: false,
        comment: 'Tipo de emisor del mensaje',
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Fecha y hora en que se envió el mensaje',
      },
      status: {
        type: Sequelize.ENUM('read', 'unread'),
        allowNull: false,
        defaultValue: 'unread',
        comment: 'Estado de lectura del mensaje',
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

      // Timestamps automáticos
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
    await queryInterface.addConstraint('channel_messages', {
      fields: ['channel_room_id'],
      type: 'foreign key',
      name: 'fk_channel_messages_channel_room_id',
      references: {
        table: 'channel_rooms',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // channel_attention_id → channel_attentions.id
    await queryInterface.addConstraint('channel_messages', {
      fields: ['channel_attention_id'],
      type: 'foreign key',
      name: 'fk_channel_messages_channel_attention_id',
      references: {
        table: 'channel_attentions',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // userId → users.id
    await queryInterface.addConstraint('channel_messages', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_channel_messages_user_id',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // created_by → users.id
    await queryInterface.addConstraint('channel_messages', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_channel_messages_created_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // updated_by → users.id
    await queryInterface.addConstraint('channel_messages', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_channel_messages_updated_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // deleted_by → users.id
    await queryInterface.addConstraint('channel_messages', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_channel_messages_deleted_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface, Sequelize) {
    // Borrar tabla y ENUMs
    await queryInterface.dropTable('channel_messages');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_channel_messages_status";',
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_channel_messages_sendertype";',
    );
  },
};
