'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('email_campaign_attachments', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      email_campaign_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'email_campaigns', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      filename: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Nombre del archivo adjunto',
      },
      mime_type: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Tipo de archivo adjunto',
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'orden',
      },
      public_url: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
        comment: 'Ruta del archivo adjunto',
      },
      
      status: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: 'Campo para habilitar o inhabilitar un registro',
      },

      // Campos de auditoría
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

    // Relación con users (created_by)
    await queryInterface.addConstraint('email_campaign_attachments', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_email_campaign_attachments_created_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // Relación con users (updated_by)
    await queryInterface.addConstraint('email_campaign_attachments', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_email_campaign_attachments_updated_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // Relación con users (deleted_by)
    await queryInterface.addConstraint('email_campaign_attachments', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_email_campaign_attachments_deleted_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('email_campaign_attachments');
  },
};
