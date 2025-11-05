'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('portfolio_details', {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Identificador de la etiqueta',
      },
      portfolio_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'Id de la carpeta asignada',
      },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'Id del usuario',
      },
      segment: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Segmento del contribuyente (ciudadano)',
      },
      profile: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Perfil del contribuyente (ciudadano)',
      },
      taxpayer_name: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Nombre del contribuyente (ciudadano)',
      },
      taxpayer_type: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Tipo de contribuyente (ciudadano)',
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
      code: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Código de contribuyente (ciudadano)',
      },
      debt: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Deuda del contribuyente (ciudadano)',
      },
      pay: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Pago de la deuda del contribuyente (ciudadano)',
      },
      code: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Código de contribuyente (ciudadano)',
      },
      // phone_1: {
      //   type: Sequelize.STRING,
      //   allowNull: true,
      //   comment: 'Teléfono 1 del contribuyente (ciudadano)',
      // },
      // phone_2: {
      //   type: Sequelize.STRING,
      //   allowNull: true,
      //   comment: 'Teléfono 2 del contribuyente (ciudadano)',
      // },
      // phone_3: {
      //   type: Sequelize.STRING,
      //   allowNull: true,
      //   comment: 'Teléfono 3 del contribuyente (ciudadano)',
      // },
      // phone_4: {
      //   type: Sequelize.STRING,
      //   allowNull: true,
      //   comment: 'Teléfono 4 del contribuyente (ciudadano)',
      // },
      // email: {
      //   type: Sequelize.STRING,
      //   allowNull: true,
      //   comment: 'Correo electrónico del contribuyente (ciudadano)',
      // },
      // whatsapp: {
      //   type: Sequelize.STRING,
      //   allowNull: true,
      //   comment: 'Whatsapp del contribuyente (ciudadano)',
      // },
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
    await queryInterface.addConstraint('portfolio_details', {
      fields: ['id'],
      type: 'primary key',
      name: 'pk_portfolio_details_id',
    }); */

    // FK portfolio_id -> portfolios.id
    await queryInterface.addConstraint('portfolio_details', {
      fields: ['portfolio_id'],
      type: 'foreign key',
      name: 'fk_portfolio_details_portfolio_id_portfolios',
      references: {
        table: 'portfolios',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK user_id -> users.id
    await queryInterface.addConstraint('portfolio_details', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_portfolio_details_user_id_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK created_by -> users.id
    await queryInterface.addConstraint('portfolio_details', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_portfolio_details_created_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK updated_by -> users.id
    await queryInterface.addConstraint('portfolio_details', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_portfolio_details_updated_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK deleted_by -> users.id
    await queryInterface.addConstraint('portfolio_details', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_portfolio_details_deleted_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('portfolio_details');
  },
};
