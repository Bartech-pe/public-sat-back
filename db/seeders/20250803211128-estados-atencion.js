'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'estado-atencion',
      [
        {
          id: 1,
          nombre: 'Resuelto',
          descripcion: 'Atención completada exitosamente',
          tipo: true,
          color: '#00c234ff',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          nombre: 'Pendiente de Cliente',
          descripcion: 'Esperando respuesta del ciudadano',
          tipo: true,
          color: '#d16928ff',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          nombre: 'Escalado',
          descripcion: 'Atención escalada a un nivel superior',
          tipo: false,
          color: '#941dd4ff',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 4,
          nombre: 'En Proceso',
          descripcion: 'Atención siendo gestionanda por asesor',
          tipo: true,
          color: '#f4e404ff',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 5,
          nombre: 'Cerrado',
          descripcion: 'Atención finalizada y acrchivada',
          tipo: true,
          color: '#373737ff',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 6,
          nombre: 'Abierto',
          descripcion: 'Atención iniciada, pendiente de gestión',
          tipo: true,
          color: '#004fcfff',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 7,
          nombre: 'Sin Asignación',
          descripcion: 'Atención sin asignación',
          tipo: true,
          color: '#004fcfff',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
         {
          id: 8,
          nombre: 'Derivado',
          descripcion: 'Atención sin asignación',
          tipo: true,
          color: '#004fcfff',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
         {
          id: 9,
          nombre: 'En Atención',
          descripcion: 'Atención sin asignación',
          tipo: true,
          color: '#004fcfff',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 10,
          nombre: 'No Deseado',
          descripcion: 'Atención sin asignación',
          tipo: true,
          color: '#004fcfff',
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
