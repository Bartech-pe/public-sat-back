'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('channel_rooms', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Identificador único del canal de conversación',
      },
      inbox_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'ID del inbox asociado',
      },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'ID del usuario responsable de la sala',
      },
      external_channel_room_id: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'ID externo del canal (ejemplo: chatId de Telegram)',
      },
      channel_citizen_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'ID del ciudadano participante en la sala',
      },
      status: {
        type: Sequelize.ENUM('pendiente', 'prioridad', 'completado'),
        allowNull: false,
        defaultValue: 'pendiente',
        comment: 'Estado de la sala de conversación',
      },
      bot_replies: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        comment: 'Indica si el bot está respondiendo en la sala',
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

    // inbox_id → inboxes.id
    await queryInterface.addConstraint('channel_rooms', {
      fields: ['inbox_id'],
      type: 'foreign key',
      name: 'fk_channel_rooms_inbox_id',
      references: {
        table: 'inboxes',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // user_id → users.id
    await queryInterface.addConstraint('channel_rooms', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_channel_rooms_user_id',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // citizen_id → channel_citizens.id
    await queryInterface.addConstraint('channel_rooms', {
      fields: ['channel_citizen_id'],
      type: 'foreign key',
      name: 'fk_channel_rooms_channel_citizen_id',
      references: {
        table: 'channel_citizens',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // created_by → users.id
    await queryInterface.addConstraint('channel_rooms', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_channel_rooms_created_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // updated_by → users.id
    await queryInterface.addConstraint('channel_rooms', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_channel_rooms_updated_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // deleted_by → users.id
    await queryInterface.addConstraint('channel_rooms', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_channel_rooms_deleted_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface, Sequelize) {
    // Borrar tabla y ENUM
    await queryInterface.dropTable('channel_rooms');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_channel_rooms_status";'
    );
  },
};
