'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('vicidial_credentials', {
      // 🔗 Relación con Inbox
      inbox_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true,
        comment: 'ID del inbox asociado a estas credenciales',
        references: {
          model: 'inboxes', // nombre real de la tabla
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      vicidial_host: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Host o URL del servidor Vicidial',
      },

      public_ip: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'IP pública del servidor Vicidial',
      },

      private_ip: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'IP privada del servidor Vicidial',
      },

      user: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Usuario de autenticación de la API de Vicidial',
      },

      password: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Contraseña de la API de Vicidial',
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

    // created_by → users.id
    await queryInterface.addConstraint('vicidial_credentials', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_vicidial_credentials_created_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // updated_by → users.id
    await queryInterface.addConstraint('vicidial_credentials', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_vicidial_credentials_updated_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // deleted_by → users.id
    await queryInterface.addConstraint('vicidial_credentials', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_vicidial_credentials_deleted_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('vicidial_credentials');
  },
};
