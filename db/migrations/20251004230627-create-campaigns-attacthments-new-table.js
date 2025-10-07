module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('email_attachments_campaigns', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      campaign_email_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'campaign_emails', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      file_name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'nombreArchivo',
      },
      file_type_code: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'codTipoArchivo',
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'orden',
      },
      base64: {
        type: Sequelize.TEXT('long'),
        allowNull: false,
        comment: 'contenido base64',
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
    await queryInterface.addConstraint('email_attachments_campaigns', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_email_attachments_campaigns_created_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // Relación con users (updated_by)
    await queryInterface.addConstraint('email_attachments_campaigns', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_email_attachments_campaigns_updated_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // Relación con users (deleted_by)
    await queryInterface.addConstraint('email_attachments_campaigns', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_email_attachments_campaigns_deleted_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('email_attachments_campaigns');
  },
};
