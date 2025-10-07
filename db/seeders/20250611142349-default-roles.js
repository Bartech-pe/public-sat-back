'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'roles',
      [
        {
          id: 1,
          name: 'administrador',
          description: 'Administrador del sistema',
          inmutable: true,
          status: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 2,
          name: 'supervisor',
          description: 'Encargado de supervisar equipos de asesores',
          inmutable: true,
          status: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 3,
          name: 'asesor',
          description: 'Encargado de asesorar al ciudadano',
          inmutable: true,
          status: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    queryInterface.bulkDelete('roles', null, {});
  },
};
