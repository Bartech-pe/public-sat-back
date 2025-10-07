'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('channel_message_attachments', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Identificador único del mensaje en el canal',
      },
      channel_message_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'ID del mensaje',
      },
      name: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Nombre del archivo adjunto',
      },
      content: {
        type: Sequelize.TEXT('long'),
        allowNull: false,
        comment: 'File encoded in base64',
      },
      extension: {
        type: Sequelize.STRING(10),
        allowNull: false,
        comment: 'File extension (png, jpg, pdf...)',
      },
      size: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'File size in bytes',
      },
      type: {
        type: Sequelize.ENUM('file', 'image'),
        allowNull: true,
        comment: 'File type: image or generic file',
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

    // channel_message_id → channel_messages.id
    await queryInterface.addConstraint('channel_message_attachments', {
      fields: ['channel_message_id'],
      type: 'foreign key',
      name: 'fk_channel_message_attachments_channel_message_id',
      references: {
        table: 'channel_messages',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // created_by → users.id
    await queryInterface.addConstraint('channel_message_attachments', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_channel_message_attachments_created_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // updated_by → users.id
    await queryInterface.addConstraint('channel_message_attachments', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_channel_message_attachments_updated_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // deleted_by → users.id
    await queryInterface.addConstraint('channel_message_attachments', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_channel_message_attachments_deleted_by',
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
    await queryInterface.dropTable('channel_message_attachments');
  },
};
