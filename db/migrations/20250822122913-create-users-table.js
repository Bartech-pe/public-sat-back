'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Identificador del usuario',
      },
      name: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: 'Nombre completo del usuario',
      },
      display_name: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
        comment: 'Nombre a mostrar en las conversaciones',
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Correo electrónico, sirve para autenticar el usuario',
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Contraseña encriptada',
      },
      avatar_url: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
        comment: 'Imagen para visualizar en el perfil',
      },
      verified_email: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: 'Correo electrónico verificado',
      },
      role_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'Id del rol asignado al usuario',
      },
      office_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        comment: 'Id de la oficina asignada al usuario',
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

    /*     // PK
    await queryInterface.addConstraint('users', {
      fields: ['id'],
      type: 'primary key',
      name: 'pk_users_id',
    }); */

    // Unique constraint en name
    await queryInterface.addConstraint('users', {
      fields: ['email'],
      type: 'unique',
      name: 'uq_users_email',
    });

    // FK role_id -> roles.id
    await queryInterface.addConstraint('users', {
      fields: ['role_id'],
      type: 'foreign key',
      name: 'fk_users_role_id_roles',
      references: {
        table: 'roles',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK office_id -> offices.id
    await queryInterface.addConstraint('users', {
      fields: ['office_id'],
      type: 'foreign key',
      name: 'fk_users_office_id_offices',
      references: {
        table: 'offices',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK created_by -> users.id
    await queryInterface.addConstraint('users', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_users_created_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK updated_by -> users.id
    await queryInterface.addConstraint('users', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_users_updated_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK deleted_by -> users.id
    await queryInterface.addConstraint('users', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_users_deleted_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  },
};
