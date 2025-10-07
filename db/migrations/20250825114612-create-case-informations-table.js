'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('case_informations', {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Identificador de la información del caso',
      },
      commitment_date: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha del compromiso de pago',
      },
      commitment_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Monto del compromiso de pago',
      },
      observation: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Observaciones generales',
      },
      follow_up: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Seguimiento',
      },
      portfolio_detail_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        comment: 'Id cartera detalle de la atención',
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
    await queryInterface.addConstraint('case_informations', {
      fields: ['id'],
      type: 'primary key',
      name: 'pk_case_informations_id',
    }); */

    // FK portfolio_detail_id -> portfolio_details.id
    await queryInterface.addConstraint('case_informations', {
      fields: ['portfolio_detail_id'],
      type: 'foreign key',
      name: 'fk_case_informations_portfolio_detail_id_portfolio_details',
      references: {
        table: 'portfolio_details',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK created_by -> users.id
    await queryInterface.addConstraint('case_informations', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_case_informations_created_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK updated_by -> users.id
    await queryInterface.addConstraint('case_informations', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_case_informations_updated_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK deleted_by -> users.id
    await queryInterface.addConstraint('case_informations', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_case_informations_deleted_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('case_informations');
  },
};
