'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('dashboard_reports', {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Identificador único del reporte del dashboard',
      },

      dashboard_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        comment: 'Id del dashboard asociado (nullable, sin FK)',
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Nombre del reporte o widget',
      },

      description: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Descripción opcional del reporte',
      },

      type: {
        type: Sequelize.ENUM('metabase', 'vicidial', 'custom'),
        allowNull: false,
        comment: 'Tipo de widget o reporte (ej: metabase, vicidial, custom)',
      },

      status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica si el reporte está habilitado o inhabilitado',
      },

      /* Auditoría */
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

      /* Timestamps */
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

    /** ------------------------------------
     * Foreign Keys de auditoría (hacia users)
     * ------------------------------------ */
    await queryInterface.addConstraint('dashboard_reports', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_dashboard_reports_created_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('dashboard_reports', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_dashboard_reports_updated_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('dashboard_reports', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_dashboard_reports_deleted_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface, Sequelize) {
    // eliminar enum antes de dropear la tabla (para evitar errores en Postgres)
    // en caso uses Postgres: drop type si existe
    try {
      await queryInterface.dropTable('dashboard_reports');
    } finally {
      // Postgres: intentar borrar el enum 'enum_dashboard_reports_type' si existe
      if (queryInterface.sequelize.getDialect() === 'postgres') {
        await queryInterface.sequelize.query(
          `DO $$
            BEGIN
              IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_dashboard_reports_type') THEN
                DROP TYPE enum_dashboard_reports_type;
              END IF;
            END$$;`
        );
      }
    }
  },
};
