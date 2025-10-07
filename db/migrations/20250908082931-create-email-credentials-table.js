'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('email_credentials', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Identificador de las credenciales de correo',
      },
      inbox_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'Relación con la bandeja de entrada',
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Correo electrónico configurado',
      },
      refresh_token: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'API key for channel integration',
      },
      client_id: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Client ID for channel integration',
      },
      client_secret: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Client Secret for channel integration',
      },
      client_project: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Client Project for channel integration',
      },
      client_topic: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Client Topic for channel integration',
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

    // inbox_id -> inboxes.id
    await queryInterface.addConstraint('email_credentials', {
      fields: ['inbox_id'],
      type: 'foreign key',
      name: 'fk_email_credentials_inbox_id',
      references: {
        table: 'inboxes',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // created_by -> users.id
    await queryInterface.addConstraint('email_credentials', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_email_credentials_created_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // updated_by -> users.id
    await queryInterface.addConstraint('email_credentials', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_email_credentials_updated_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // deleted_by -> users.id
    await queryInterface.addConstraint('email_credentials', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_email_credentials_deleted_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('email_credentials');
  },
};
