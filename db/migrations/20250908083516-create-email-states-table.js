'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('email_states', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Identificador del estado de correo',
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Nombre del Estado del Correo',
      },
      code: {
        type: Sequelize.STRING(10),
        allowNull: false,
        comment: 'Código del Estado del Correo',
      },
      icon: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Ícono del Estado del Correo',
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

    // created_by -> users.id
    await queryInterface.addConstraint('email_states', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_email_states_created_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // updated_by -> users.id
    await queryInterface.addConstraint('email_states', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_email_states_updated_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // deleted_by -> users.id
    await queryInterface.addConstraint('email_states', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_email_states_deleted_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('email_states');
  },
};
