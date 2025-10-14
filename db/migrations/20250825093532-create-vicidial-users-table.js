'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('vicidial_users', {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Identificador del usuario vicidial',
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Username del agente en Vicidial',
      },
      user_password: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Password de usuario en Vicidial',
      },
      phone_login: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Extensión/teléfono del agente',
      },
      phone_password: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Password del teléfono SIP',
      },
      user_level: {
        type: Sequelize.TINYINT,
        allowNull: false,
        comment: 'Nivel de usuario (1=agente, 9=admin)',
      },
      user_group: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Grupo del usuario (ej: AGENTS)',
      },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true,
        comment: 'Id del usuario',
      },
      channel_state_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        comment: 'Id del estado del canal',
      },
      pause_code: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Código de pausa vicidial',
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

    // FK user_id -> users.id
    await queryInterface.addConstraint('vicidial_users', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_vicidial_users_user_id_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK channel_state_id -> channel_states.id
    await queryInterface.addConstraint('vicidial_users', {
      fields: ['channel_state_id'],
      type: 'foreign key',
      name: 'fk_vicidial_users_channel_state_id_channel_states',
      references: {
        table: 'channel_states',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK created_by -> users.id
    await queryInterface.addConstraint('vicidial_users', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_vicidial_users_created_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK updated_by -> users.id
    await queryInterface.addConstraint('vicidial_users', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_vicidial_users_updated_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // FK deleted_by -> users.id
    await queryInterface.addConstraint('vicidial_users', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_vicidial_users_deleted_by_users',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('vicidial_users');
  },
};
