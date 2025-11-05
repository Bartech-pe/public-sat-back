'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('portfolios', {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Identificador de la etiqueta',
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Nombre de la etiqueta',
      },
      description: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
        comment: 'Descripción de la etiqueta',
      },
      date_start: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Fecha de inicio',
      },
      date_end: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Fecha de fin',
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Monto',
      },
      office_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        comment: 'Id de la oficina asignada al usuario',
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
    await queryInterface.addConstraint('portfolios', {
      fields: ['id'],
      type: 'primary key',
      name: 'pk_portfolios_id',
    }); */

    // FK office_id -> offices.id
    await queryInterface.addConstraint('portfolios', {
      fields: ['office_id'],
      type: 'foreign key',
      name: 'fk_portfolios_office_id_offices',
      references: {
        table: 'offices',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK created_by -> users.id
    await queryInterface.addConstraint('portfolios', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_portfolios_created_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK updated_by -> users.id
    await queryInterface.addConstraint('portfolios', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_portfolios_updated_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK deleted_by -> users.id
    await queryInterface.addConstraint('portfolios', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_portfolios_deleted_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('portfolios');
  },
};
