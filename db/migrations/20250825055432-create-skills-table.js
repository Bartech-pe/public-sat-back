'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('skills', {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Identificador de la habilidad',
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Nombre de la habilidad',
      },
      category: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Categoría de la habilidad',
      },
      description: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
        comment: 'Descripción de la habilidad',
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
    await queryInterface.addConstraint('skills', {
      fields: ['id'],
      type: 'primary key',
      name: 'pk_skills_id',
    }); */

    // FK created_by -> users.id
    await queryInterface.addConstraint('skills', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_skills_created_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK updated_by -> users.id
    await queryInterface.addConstraint('skills', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_skills_updated_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK deleted_by -> users.id
    await queryInterface.addConstraint('skills', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_skills_deleted_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('skills');
  },
};
