'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('chat_room_messages', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM('text', 'image', 'file', 'audio', 'video'),
        allowNull: false,
        comment: 'Tipo de mensaje (texto, imagen, archivo, audio, video)',
      },
      content: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Contenido del mensaje',
      },
      chat_room_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'Id del chat room del mensaje',
      },
      sender_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'Id del usuario que envió el mensaje',
      },
      resource_url: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Recurso adjunto, si aplica (URL o resource ID)',
      },
      is_read: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: 'Mensaje leído o no',
      },
      status: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
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

    // chat_room_id -> chat_rooms.id
    await queryInterface.addConstraint('chat_room_messages', {
      fields: ['chat_room_id'],
      type: 'foreign key',
      name: 'fk_chat_room_messages_chat_room_id',
      references: {
        table: 'chat_rooms',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // sender_id -> users.id
    await queryInterface.addConstraint('chat_room_messages', {
      fields: ['sender_id'],
      type: 'foreign key',
      name: 'fk_chat_room_messages_sender_id',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // Auditoría: created_by
    await queryInterface.addConstraint('chat_room_messages', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_chat_room_messages_created_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // Auditoría: updated_by
    await queryInterface.addConstraint('chat_room_messages', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_chat_room_messages_updated_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // Auditoría: deleted_by
    await queryInterface.addConstraint('chat_room_messages', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_chat_room_messages_deleted_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('chat_room_messages');
  },
};
