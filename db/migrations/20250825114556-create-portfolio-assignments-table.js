'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('portfolio_assignments', {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Identificador de la asignación de cartera',
      },
      portfolio_detail_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'Detalle de cartera (relación con PortfolioDetail)',
      },
      user_prev_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'Id del usuario anterior asignado',
      },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'Id del usuario actual asignado',
      },
      status: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
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

    // FK portfolio_detail_id -> portfolio_details.id
    await queryInterface.addConstraint('portfolio_assignments', {
      fields: ['portfolio_detail_id'],
      type: 'foreign key',
      name: 'fk_portfolio_assignments_portfolio_detail_id',
      references: {
        table: 'portfolio_details',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK user_prev_id -> users.id
    await queryInterface.addConstraint('portfolio_assignments', {
      fields: ['user_prev_id'],
      type: 'foreign key',
      name: 'fk_portfolio_assignments_user_prev_id_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK user_id -> users.id
    await queryInterface.addConstraint('portfolio_assignments', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_portfolio_assignments_user_id_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // Auditoría -> users.id
    await queryInterface.addConstraint('portfolio_assignments', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_portfolio_assignments_created_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    await queryInterface.addConstraint('portfolio_assignments', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_portfolio_assignments_updated_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    await queryInterface.addConstraint('portfolio_assignments', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_portfolio_assignments_deleted_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('portfolio_assignments');
  },
};
