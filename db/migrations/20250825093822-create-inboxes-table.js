'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('inboxes', {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Identificador de la bandeja de entrada',
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Nombre de la bandeja de entrada',
      },
      avatar_url: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Imagen del canal',
      },
      widget_color: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Widget color del canal',
      },
      channel_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'ID del canal al que pertenece este inbox',
      },
      status: {
        type: Sequelize.BOOLEAN,
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

    /* // PK
    await queryInterface.addConstraint('inboxes', {
      fields: ['id'],
      type: 'primary key',
      name: 'pk_inboxes_id',
    }); */

    // FK channel_id -> channels.id
    await queryInterface.addConstraint('inboxes', {
      fields: ['channel_id'],
      type: 'foreign key',
      name: 'fk_inboxes_channel_id_channels',
      references: {
        table: 'channels',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK created_by -> users.id
    await queryInterface.addConstraint('inboxes', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_inboxes_created_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK updated_by -> users.id
    await queryInterface.addConstraint('inboxes', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_inboxes_updated_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK deleted_by -> users.id
    await queryInterface.addConstraint('inboxes', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_inboxes_deleted_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('inboxes');
  },
};
