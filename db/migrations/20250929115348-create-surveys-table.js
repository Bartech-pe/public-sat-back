'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('surveys', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      assistance_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'ID of the associated assistance',
      },
      channel_room_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'ID of the channel room',
      },
      citizen_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'ID of the citizen',
      },
      comment: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Comment provided in the survey',
      },
      rating: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        comment: 'Rating given in the survey (1-5)',
      },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'ID of the user who submitted the survey',
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

    // user_id → campaigns.id
    await queryInterface.addConstraint('surveys', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_surveys_user_id_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT', // si se elimina la campaña, se mantiene el horario sin asociación
    });

    // created_by → users.id
    await queryInterface.addConstraint('surveys', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_surveys_created_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // updated_by → users.id
    await queryInterface.addConstraint('surveys', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_surveys_updated_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // deleted_by → users.id
    await queryInterface.addConstraint('surveys', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_surveys_deleted_by',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('surveys');
  },
};
