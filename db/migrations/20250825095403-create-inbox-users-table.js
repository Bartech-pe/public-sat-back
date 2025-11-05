'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('inbox_users', {
      inbox_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true,
        comment: 'Id de la bandeja de entrada',
      },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true,
        comment: 'Id del usuario',
      },
      channel_state_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        comment: 'Id del estado del canal',
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

    // UNIQUE constraint explícita
    await queryInterface.addConstraint('inbox_users', {
      fields: ['inbox_id', 'user_id'],
      type: 'unique',
      name: 'uq_inbox_users_inbox_id_user_id',
    });

    // FK inbox_id -> inboxes.id
    await queryInterface.addConstraint('inbox_users', {
      fields: ['inbox_id'],
      type: 'foreign key',
      name: 'fk_inbox_users_inbox_id_inboxes',
      references: {
        table: 'inboxes',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK user_id -> users.id
    await queryInterface.addConstraint('inbox_users', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_inbox_users_user_id_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK channel_state_id -> channel_states.id
    await queryInterface.addConstraint('inbox_users', {
      fields: ['channel_state_id'],
      type: 'foreign key',
      name: 'fk_inbox_users_channel_state_id_channel_states',
      references: {
        table: 'channel_states',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK created_by -> users.id
    await queryInterface.addConstraint('inbox_users', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_inbox_users_created_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK updated_by -> users.id
    await queryInterface.addConstraint('inbox_users', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_inbox_users_updated_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK deleted_by -> users.id
    await queryInterface.addConstraint('inbox_users', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_inbox_users_deleted_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('inbox_users');
  },
};
