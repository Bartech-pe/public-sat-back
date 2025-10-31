'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('email_attachments', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Identificador del archivo adjunto',
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
      attachment_gmail_id: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
        comment: 'ID de Gmail del archivo adjunto',
      },
      email_thread_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'Id del hilo de correo del adjunto',
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

    // Relación con email_threads
    await queryInterface.addConstraint('email_attachments', {
      fields: ['email_thread_id'],
      type: 'foreign key',
      name: 'fk_email_attachments_email_thread_id_email_threads',
      references: {
        table: 'email_threads',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // Relación con users (created_by)
    await queryInterface.addConstraint('email_attachments', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_email_attachments_created_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // Relación con users (updated_by)
    await queryInterface.addConstraint('email_attachments', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_email_attachments_updated_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // Relación con users (deleted_by)
    await queryInterface.addConstraint('email_attachments', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_email_attachments_deleted_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('email_attachments');
  },
};
