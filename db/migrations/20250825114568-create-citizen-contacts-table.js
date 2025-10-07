'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('citizen_contacts', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Identificador del contacto del ciudadano',
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
      contact_type: {
        type: Sequelize.ENUM('PHONE', 'EMAIL', 'WHATSAPP'),
        allowNull: true,
        comment: 'Tipo de contacto',
      },
      value: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Valor de contacto',
      },
      is_additional: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: 'Es información adicional',
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

    // created_by → users.id
    await queryInterface.addConstraint('citizen_contacts', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_citizen_contacts_created_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // updated_by → users.id
    await queryInterface.addConstraint('citizen_contacts', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_citizen_contacts_updated_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // deleted_by → users.id
    await queryInterface.addConstraint('citizen_contacts', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_citizen_contacts_deleted_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('citizen_contacts');
  },
};
