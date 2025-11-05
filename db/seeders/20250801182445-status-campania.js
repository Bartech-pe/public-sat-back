'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'estado-campania',
      [
        {
          id: 1,
          nombre: 'Finalizada',
          descripcion: 'Campaña completada',
          tipo: true,
          color: '#0f0f0e',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          nombre: 'Pausada',
          descripcion: 'Campaña temporariamente pausada',
          tipo: false,
          color: '#d16928ff',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          nombre: 'Programada',
          descripcion: 'Campaña creada, pendiente de inicio',
          tipo: true,
          color: '#2860d1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 4,
          nombre: 'Activa',
          descripcion: 'Campaña en ejecución',
          tipo: true,
          color: '#15ff00',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
