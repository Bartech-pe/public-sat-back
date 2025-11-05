'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('campaign_emails', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },

      id_campaign_email_config: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'campaign_email_configs', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },

      process_code: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'codProceso',
      },
      sender_code: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'codRemitente',
      },
      to: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'correoDestino',
      },
      cc: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'correoConCopia',
      },
      bcc: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'correoConCopiaOculta',
      },
      subject: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'asunto',
      },
      message: {
        type: Sequelize.TEXT('long'),
        allowNull: false,
        comment: 'mensaje',
      },
      document_type_code: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'codTipDocumento',
      },
      document_type_value: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'valTipDocumento',
      },
      terminal_name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'nomTerminal',
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
    await queryInterface.addConstraint('campaign_emails', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_campaign_emails_created_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // Relación con users (updated_by)
    await queryInterface.addConstraint('campaign_emails', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_campaign_emails_updated_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // Relación con users (deleted_by)
    await queryInterface.addConstraint('campaign_emails', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_campaign_emails_deleted_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('campaign_emails');
  },
};
