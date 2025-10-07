'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('departments', {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Identificador del área',
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Nombre del área',
      },
      description: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
        comment: 'Descripción del área',
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
    await queryInterface.addConstraint('departments', {
      fields: ['id'],
      type: 'primary key',
      name: 'pk_departments_id',
    }); */
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('departments');
  },
};
