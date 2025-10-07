'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('email_threads', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Identificador del hilo de correo',
      },
      subject: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Asunto del correo',
      },
      content: {
        type: Sequelize.TEXT('long'),
        allowNull: false,
        comment: 'Contenido del correo',
      },
      from: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Correo electrónico del remitente',
      },
      to: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Correo electrónico del destinatario',
      },
      email_attention_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'Relación con email_assistances (ticket de atención)',
      },
      in_reply_to: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      references_mail: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
      },
      type: {
        type: Sequelize.ENUM('01', '02', '03', '04'),
        allowNull: false,
      },
      email_state_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'Id Estado de Correo',
      },
      is_favorite: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si el correo está marcado como favorito',
      },
      is_read: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si el correo ya fue leído',
      },
      message_gmail_id: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      message_header_gmail_id: {
        type: Sequelize.STRING(255),
        allowNull: false,
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

    // Relación con email_attentions
    await queryInterface.addConstraint('email_threads', {
      fields: ['email_attention_id'],
      type: 'foreign key',
      name: 'fk_email_threads_email_attention_id_email_attentions',
      references: {
        table: 'email_attentions',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // Relación con email_states
    await queryInterface.addConstraint('email_threads', {
      fields: ['email_state_id'],
      type: 'foreign key',
      name: 'fk_email_threads_email_state_id_mail_stateS',
      references: {
        table: 'email_states',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // Relación con users (created_by)
    await queryInterface.addConstraint('email_threads', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_email_threads_created_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // Relación con users (updated_by)
    await queryInterface.addConstraint('email_threads', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_email_threads_updated_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // Relación con users (deleted_by)
    await queryInterface.addConstraint('email_threads', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_email_threads_deleted_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('email_threads');
  },
};
