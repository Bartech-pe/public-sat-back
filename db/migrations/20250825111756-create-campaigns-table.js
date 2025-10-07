'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('campaigns', {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Identificador único de la campaña',
      },
      name: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Nombre de la campaña',
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Descripción de la campaña',
      },
      campaign_type_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'Tipo de campaña (relación con CampaignType)',
      },
      department_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        comment: 'ID del área asignada a la campaña',
      },
      campaign_state_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'Estado actual de la campaña (relación con CampaignState)',
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de inicio de la campaña',
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de finalización de la campaña',
      },
      start_time: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Hora de inicio de la campaña',
      },
      end_time: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Hora de fin de la campaña',
      },
      start_day: {
        type: Sequelize.SMALLINT,
        allowNull: true,
        comment: 'Día de la semana de inicio de la campaña',
      },
      end_day: {
        type: Sequelize.SMALLINT,
        allowNull: true,
        comment: 'Día de la semana de fin de la campaña',
      },
      apply_holiday: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Aplicar campaña en días feriados',
      },
      valid_until: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de vigencia de la campaña',
      },
      vd_campaign_id: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Identificador de la campaña en un sistema externo (VD)',
      },
      status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica si la campaña está habilitada o inhabilitada',
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

    // FK campaign_type_id -> campaign_types.id
    await queryInterface.addConstraint('campaigns', {
      fields: ['campaign_type_id'],
      type: 'foreign key',
      name: 'fk_campaigns_campaign_type_id_campaign_types',
      references: {
        table: 'campaign_types',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK department_id -> departments.id
    await queryInterface.addConstraint('campaigns', {
      fields: ['department_id'],
      type: 'foreign key',
      name: 'fk_campaigns_department_id_departments',
      references: {
        table: 'departments',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK campaign_state_id -> campaign_states.id
    await queryInterface.addConstraint('campaigns', {
      fields: ['campaign_state_id'],
      type: 'foreign key',
      name: 'fk_campaigns_campaign_state_id_campaign_states',
      references: {
        table: 'campaign_states',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK created_by -> users.id
    await queryInterface.addConstraint('campaigns', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_campaigns_created_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK updated_by -> users.id
    await queryInterface.addConstraint('campaigns', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_campaigns_updated_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK deleted_by -> users.id
    await queryInterface.addConstraint('campaigns', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_campaigns_deleted_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('campaigns');
  },
};
