'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('campaign_states', {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Identificador único del estado de la campaña',
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Nombre del estado de la campaña',
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Descripción del estado de la campaña',
      },
      color: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Color representativo del estado de la campaña',
      },
      status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica si el estado está habilitado o inhabilitado',
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

    // FK created_by -> users.id
    await queryInterface.addConstraint('campaign_states', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_campaign_states_created_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK updated_by -> users.id
    await queryInterface.addConstraint('campaign_states', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_campaign_states_updated_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK deleted_by -> users.id
    await queryInterface.addConstraint('campaign_states', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_campaign_states_deleted_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('campaign_states');
  },
};
