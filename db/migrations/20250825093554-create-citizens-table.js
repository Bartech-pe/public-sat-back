'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('citizens', {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Identificador del canal',
      },
      tip_doc: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Tipo de documento de identificación del ciudadano',
      },
      doc_ide: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Documento de identificación del ciudadano',
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Nombre del canal',
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
    await queryInterface.addConstraint('citizens', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_citizens_created_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK updated_by -> users.id
    await queryInterface.addConstraint('citizens', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_citizens_updated_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK deleted_by -> users.id
    await queryInterface.addConstraint('citizens', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_citizens_deleted_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('citizens');
  },
};
