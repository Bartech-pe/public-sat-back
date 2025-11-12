'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sms_campaign_details', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      sender_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      contact: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      sms_campaign_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'Id de la campaña sms',
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      active: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Estado actual de la campaña (relación con CampaignState)',
      },
      created_by: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      updated_by: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      deleted_by: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal(
          'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
        ),
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // // 2️⃣ Agregar claves foráneas (una por una)
    // await queryInterface.addConstraint('sms_campaign_details', {
    //   fields: ['campaign_id'],
    //   type: 'foreign key',
    //   name: 'fk_sms_campaign_details_campaign_id_campaigns',
    //   references: {
    //     table: 'campaigns',
    //     field: 'id',
    //   },
    //   onUpdate: 'CASCADE',
    //   onDelete: 'CASCADE',
    // });


     await queryInterface.addConstraint('sms_campaign_details', {
      fields: ['sms_campaign_id'],
      type: 'foreign key',
      name: 'fk_portfolio_details_sms_campaigns',
      references: {
        table: 'sms_campaigns',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    await queryInterface.addConstraint('sms_campaign_details', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_sms_campaign_details_created_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sms_campaign_details', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_sms_campaign_details_updated_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sms_campaign_details', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_sms_campaign_details_deleted_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('sms_campaign_details');
  },
};
