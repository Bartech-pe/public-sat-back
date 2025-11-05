'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('holidays', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Identificador del feriado',
      },
      title: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Título del feriado',
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Descripción del feriado',
      },
      start_time: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Fecha y hora de inicio del feriado',
      },
      end_time: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Fecha y hora de fin del feriado',
      },
      status: {
        type: Sequelize.BOOLEAN,
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

    // created_by → users.id
    await queryInterface.addConstraint('holidays', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_holidays_created_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // updated_by → users.id
    await queryInterface.addConstraint('holidays', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_holidays_updated_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // deleted_by → users.id
    await queryInterface.addConstraint('holidays', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_holidays_deleted_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('holidays');
  },
};
