'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('channel_assistances', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Identificador único de la asistencia',
      },
      consult_type_code: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Id del tipo de consulta',
      },
      citizen_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'Identificador del ciudadano',
      },
      category_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'ID del canal al que pertenece el estado',
      },
      detail: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Detalle de la atención',
      },
      communication_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'Identificador de la comunicación del ciudadano',
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
        comment: 'Fecha de creación del registro',
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

    // FK citizen_id -> citizens.id
    await queryInterface.addConstraint('channel_assistances', {
      fields: ['citizen_id'],
      type: 'foreign key',
      name: 'fk_channel_assistances_citizen_id_citizens',
      references: {
        table: 'citizens',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK category_id -> category_channels.id
    await queryInterface.addConstraint('channel_assistances', {
      fields: ['category_id'],
      type: 'foreign key',
      name: 'fk_channel_assistances_category_id_category_channels',
      references: {
        table: 'category_channels',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // created_by → users.id
    await queryInterface.addConstraint('channel_assistances', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_channel_assistances_created_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // updated_by → users.id
    await queryInterface.addConstraint('channel_assistances', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_channel_assistances_updated_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // deleted_by → users.id
    await queryInterface.addConstraint('channel_assistances', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_channel_assistances_deleted_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface, Sequelize) {
    // Eliminamos la tabla y ENUMs asociados
    await queryInterface.dropTable('channel_assistances');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_channel_assistances_state";',
    );
  },
};
