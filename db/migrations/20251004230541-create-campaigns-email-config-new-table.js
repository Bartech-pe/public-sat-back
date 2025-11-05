'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('campaign_email_configs', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'nombre Campaña',
      },

      id_template: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'template_emails', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },

      total_registration: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'total_registration',
      },

      campaign_status: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'campaign Status',
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
    await queryInterface.addConstraint('campaign_email_configs', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_campaign_email_configs_created_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // Relación con users (updated_by)
    await queryInterface.addConstraint('campaign_email_configs', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_campaign_email_configs_updated_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // Relación con users (deleted_by)
    await queryInterface.addConstraint('campaign_email_configs', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_campaign_email_configs_deleted_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('campaign_email_configs');
  },
};
