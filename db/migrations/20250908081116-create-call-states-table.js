'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('call_states', {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Identificador del estado de atención',
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Nombre del estado de atención',
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Descripción del estado de la campaña',
      },
      icon: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Icono del estado de atención',
      },
      style: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Estilo del estado de atención',
      },
      status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Campo para habilitar o inhabilitar un registro',
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
        comment: 'Usuario que eliminó el registro (eliminación lógica)',
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
        comment: 'Fecha de actualización',
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

    // Auditoría -> users.id
    await queryInterface.addConstraint('call_states', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_call_states_created_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    await queryInterface.addConstraint('call_states', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_call_states_updated_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    await queryInterface.addConstraint('call_states', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_call_states_deleted_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('call_states');
  },
};
