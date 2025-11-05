'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_chat_rooms', {
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true,
        comment: 'Id del usuario participante',
      },
      chat_room_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true,
        comment: 'Id del chat room',
      },
      last_read_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Última vez que el usuario leyó los mensajes',
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        comment: 'Si el participante está activo en la conversación',
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

    // user_id -> users.id
    await queryInterface.addConstraint('user_chat_rooms', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_user_chat_rooms_user_id',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // chat_room_id -> chat_rooms.id
    await queryInterface.addConstraint('user_chat_rooms', {
      fields: ['chat_room_id'],
      type: 'foreign key',
      name: 'fk_user_chat_rooms_chat_room_id',
      references: {
        table: 'chat_rooms',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // Auditoría: created_by
    await queryInterface.addConstraint('user_chat_rooms', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_user_chat_rooms_created_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // Auditoría: updated_by
    await queryInterface.addConstraint('user_chat_rooms', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_user_chat_rooms_updated_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // Auditoría: deleted_by
    await queryInterface.addConstraint('user_chat_rooms', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_user_chat_rooms_deleted_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_chat_rooms');
  },
};
