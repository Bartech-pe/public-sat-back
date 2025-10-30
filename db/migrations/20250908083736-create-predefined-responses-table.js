'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('predefined_responses', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Identificador de la respuesta predefinida',
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Título de la respuesta predefinida',
      },
      code: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Código corto de la respuesta predefinida',
      },
      content: {
        type: Sequelize.TEXT('long'),
        allowNull: false,
        comment: 'Contenido de la respuesta predefinida',
      },
      keywords: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Palabras clave asociadas a la respuesta predefinida',
      },
      category_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'ID del canal al que pertenece el estado',
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

      // Fechas
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

    // FK category_id -> category_channels.id
    await queryInterface.addConstraint('predefined_responses', {
      fields: ['category_id'],
      type: 'foreign key',
      name: 'fk_predefined_responses_category_id_category_channels',
      references: {
        table: 'category_channels',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // created_by → users.id
    await queryInterface.addConstraint('predefined_responses', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_predefined_responses_created_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // updated_by → users.id
    await queryInterface.addConstraint('predefined_responses', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_predefined_responses_updated_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // deleted_by → users.id
    await queryInterface.addConstraint('predefined_responses', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_predefined_responses_deleted_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('predefined_responses');
  },
};
