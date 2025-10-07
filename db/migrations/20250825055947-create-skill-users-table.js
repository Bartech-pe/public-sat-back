'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('skill_users', {
      skill_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true,
        comment: 'Id de la habilidad',
      },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true,
        comment: 'Id del usuario',
      },
      score: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        allowNull: false,
        comment: 'Puntaje asignado al usuario en la habilidad',
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

    // // PRIMARY KEY compuesta (skill_id + user_id)
    // await queryInterface.addConstraint('skill_users', {
    //   fields: ['skill_id', 'user_id'],
    //   type: 'primary key',
    //   name: 'pk_skill_users',
    // });

    // UNIQUE constraint explícita
    await queryInterface.addConstraint('skill_users', {
      fields: ['skill_id', 'user_id'],
      type: 'unique',
      name: 'uq_skill_users_skill_id_user_id',
    });

    // FK created_by -> users.id
    await queryInterface.addConstraint('skill_users', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_skill_users_created_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK updated_by -> users.id
    await queryInterface.addConstraint('skill_users', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_skill_users_updated_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK deleted_by -> users.id
    await queryInterface.addConstraint('skill_users', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_skill_users_deleted_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('skill_users');
  },
};
