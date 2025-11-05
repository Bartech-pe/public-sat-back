module.exports = {

  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('template_emails', {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
          comment: 'Nombre de la plantilla',
        },
        template: {
          type: Sequelize.TEXT('long'),
          allowNull: true,
          comment: 'Contenido HTML de la plantilla de correo',
        },
        status: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
          comment: 'Campo para habilitar o inhabilitar un registro',
        },

        createdBy: {
          field: 'created_by',
          type: Sequelize.BIGINT,
          allowNull: true,
        },
        updatedBy: {
          field: 'updated_by',
          type: Sequelize.BIGINT,
          allowNull: true,
        },
        deletedBy: {
          field: 'deleted_by',
          type: Sequelize.BIGINT,
          allowNull: true,
        },

        createdAt: {
          field: 'created_at',
          type: Sequelize.DATE,
          allowNull: true,
        },
        updatedAt: {
          field: 'updated_at',
          type: Sequelize.DATE,
          allowNull: true,
        },
        deletedAt: {
          field: 'deleted_at',
          type: Sequelize.DATE,
          allowNull: true,
        },
    });
  },

  async down (queryInterface) {
    await queryInterface.dropTable('template_emails');
  }

};
