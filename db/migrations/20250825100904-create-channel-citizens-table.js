'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('channel_citizens', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Identificador único del ciudadano',
      },
      external_user_id: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Identificador externo del ciudadano',
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Nombre del ciudadano',
      },
      full_name: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Nombre completo del ciudadano',
      },
      is_external: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si el ciudadano fue creado desde un chat externo',
      },
      phone_number: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Número de teléfono del ciudadano',
      },
      document_number: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Número de documento de identidad',
      },
      document_type: {
        type: Sequelize.ENUM('DNI', 'CE', 'OTRO'),
        allowNull: true,
        comment: 'Tipo de documento de identidad',
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Correo electrónico del ciudadano',
      },
      avatar_url: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'URL del avatar del ciudadano',
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
    await queryInterface.addConstraint('channel_citizens', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_channel_citizens_created_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // updated_by → users.id
    await queryInterface.addConstraint('channel_citizens', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_channel_citizens_updated_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // deleted_by → users.id
    await queryInterface.addConstraint('channel_citizens', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_channel_citizens_deleted_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('channel_citizens');
  },
};
