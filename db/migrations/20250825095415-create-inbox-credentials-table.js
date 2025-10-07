'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('inbox_credentials', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Identificador único de la credencial de bandeja',
      },
      inbox_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'ID de la bandeja a la que pertenece la credencial',
      },
      access_token: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Token de acceso o API key para la integración del canal',
      },
      phone_number_id: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'ID del número de teléfono en WhatsApp Business',
      },
      business_id: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'ID de la cuenta de WhatsApp Business',
      },
      phone_number: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Número de teléfono (WhatsApp, SMS, etc.)',
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha y hora de expiración del token',
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

    // inbox_id → inboxes.id
    await queryInterface.addConstraint('inbox_credentials', {
      fields: ['inbox_id'],
      type: 'foreign key',
      name: 'fk_inbox_credentials_inbox_id',
      references: {
        table: 'inboxes',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE', // si se elimina la bandeja, se eliminan sus credenciales
    });

    // created_by → users.id
    await queryInterface.addConstraint('inbox_credentials', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_inbox_credentials_created_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // updated_by → users.id
    await queryInterface.addConstraint('inbox_credentials', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_inbox_credentials_updated_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // deleted_by → users.id
    await queryInterface.addConstraint('inbox_credentials', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_inbox_credentials_deleted_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('inbox_credentials');
  },
};
