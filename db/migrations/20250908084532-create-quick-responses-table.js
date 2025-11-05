'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('quick_responses', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Identificador de la respuesta rápida',
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Título de la respuesta rápida',
      },
      content: {
        type: Sequelize.STRING(500),
        allowNull: false,
        comment: 'Contenido de la respuesta rápida',
      },
      keywords: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Palabras clave asociadas a la respuesta rápida',
      },
      quick_response_category_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'Categoría a la que pertenece la respuesta rápida',
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

    // quick_response_category_id → quick_response_categories.id
    await queryInterface.addConstraint('quick_responses', {
      fields: ['quick_response_category_id'],
      type: 'foreign key',
      name: 'fk_quick_responses_category',
      references: {
        table: 'quick_response_categories',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // created_by → users.id
    await queryInterface.addConstraint('quick_responses', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_quick_responses_created_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // updated_by → users.id
    await queryInterface.addConstraint('quick_responses', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_quick_responses_updated_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // deleted_by → users.id
    await queryInterface.addConstraint('quick_responses', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_quick_responses_deleted_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('quick_responses');
  },
};
