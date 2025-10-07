'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('citizen_assistances', {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Identificador de la atención al ciudadano',
      },
      method: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Metodo de atención',
      },
      type: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Tipo de atención',
      },
      channel: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Canal de atención',
      },
      contact: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Contacto de atención',
      },
      result: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Resultado de atención',
      },
      observation: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Observación de atención',
      },
      tip_doc: {
        type: Sequelize.STRING,
        allowNull: true,
        comment:
          'Tipo de documento de identificación del ciudadano',
      },
      doc_ide: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Documento de identificación del ciudadano',
      },
      verify_payment: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Campo para marcar si es una verificación de pago',
      },
      portfolio_detail_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
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
    await queryInterface.addConstraint('citizen_assistances', {
      fields: ['id'],
      type: 'primary key',
      name: 'pk_citizen_assistances_id',
    }); */

    // FK portfolio_detail_id -> portfolio_details.id
    await queryInterface.addConstraint('citizen_assistances', {
      fields: ['portfolio_detail_id'],
      type: 'foreign key',
      name: 'fk_citizen_assistances_portfolio_detail_id_portfolio_details',
      references: {
        table: 'portfolio_details',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK created_by -> users.id
    await queryInterface.addConstraint('citizen_assistances', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_citizen_assistances_created_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK updated_by -> users.id
    await queryInterface.addConstraint('citizen_assistances', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_citizen_assistances_updated_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK deleted_by -> users.id
    await queryInterface.addConstraint('citizen_assistances', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_citizen_assistances_deleted_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('citizen_assistances');
  },
};
