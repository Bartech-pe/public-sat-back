'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('offices', {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Identificador de la oficina',
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Nombre de la oficina',
      },
      description: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
        comment: 'Descripción de la oficina',
      },
      department_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        comment: 'Id del área del que depende la oficina',
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
    await queryInterface.addConstraint('offices', {
      fields: ['id'],
      type: 'primary key',
      name: 'pk_offices_id',
    }); */

    // FK department_id -> departments.id
    await queryInterface.addConstraint('offices', {
      fields: ['department_id'],
      type: 'foreign key',
      name: 'fk_offices_department_id_departments',
      references: {
        table: 'departments',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('offices');
  },
};
