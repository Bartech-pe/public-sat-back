'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('roles', {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Identificador del rol',
      },
      name: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: 'Nombre del rol',
      },
      description: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
        comment: 'Descripción del rol',
      },
      inmutable: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Campo para habilitar o inhabilitar la edición de un registro',
      },
      status: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: 'Campo para habilitar o inhabilitar un registro',
      },

      // Auditoría con FK hacia users
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
     * Constraints nombrados
     * ------------------------- */

    /* // PK
    await queryInterface.addConstraint('roles', {
      fields: ['id'],
      type: 'primary key',
      name: 'pk_roles_id',
    }); */

    // Unique constraint en name
    await queryInterface.addConstraint('roles', {
      fields: ['name'],
      type: 'unique',
      name: 'uq_roles_name',
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('roles');
  },
};
