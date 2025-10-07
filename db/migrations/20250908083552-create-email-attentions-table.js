'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('email_attentions', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Identificador de la asistencia por email',
      },
      email_citizen: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Correo del ciudadano',
      },
      advisor_user_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        comment: 'Usuario asesor asignado',
      },
      advisor_inbox_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        comment: 'Bandeja de entrada',
      },
      assistance_state_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'Estado de atención asignado al ticket',
      },
      ticket_code: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Código único del ticket',
      },
      email_thread_id: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Id del hilo de correo',
      },
      closed_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de cierre de atención',
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

    // user_id -> users.user_id
    await queryInterface.addConstraint('email_attentions', {
      fields: ['advisor_user_id'],
      type: 'foreign key',
      name: 'fk_email_attentions_advisor_user_id_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // inbox_id -> inboxes.id
    await queryInterface.addConstraint('email_attentions', {
      fields: ['advisor_inbox_id'],
      type: 'foreign key',
      name: 'fk_email_attentions_advisor_inbox_id_inboxes',
      references: {
        table: 'inboxes',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // assistance_state_id -> assistance_states.id
    await queryInterface.addConstraint('email_attentions', {
      fields: ['assistance_state_id'],
      type: 'foreign key',
      name: 'fk_email_attentions_assistance_state_id_assistance_states',
      references: {
        table: 'assistance_states',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // created_by -> users.id
    await queryInterface.addConstraint('email_attentions', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_email_attentions_created_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // updated_by -> users.id
    await queryInterface.addConstraint('email_attentions', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_email_attentions_updated_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // deleted_by -> users.id
    await queryInterface.addConstraint('email_attentions', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_email_attentions_deleted_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('email_attentions');
  },
};
