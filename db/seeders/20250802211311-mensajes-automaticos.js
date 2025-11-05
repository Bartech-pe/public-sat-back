'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'mensaje-automatico',
      [
        // ChatSAT - tipo: 1
        {
          id: 1,
          nombre: 'Error/TimeOut',
          descripcion: 'Problemas técnicos',
          tipo: 1,
          estado: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          nombre: 'Agente Ocupado',
          descripcion: 'Sin asesores disponibles',
          tipo: 1,
          estado: false,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
        {
          id: 3,
          nombre: 'Fuera de Horario',
          descripcion: 'Cuando SAT está cerrado',
          tipo: 1,
          estado: true,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
        {
          id: 4,
          nombre: 'Finalización',
          descripcion: 'Al cerrar la conversación',
          tipo: 1,
          estado: false,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
        {
          id: 5,
          nombre: 'Transferencia',
          descripcion: 'Al transferir a especialista',
          tipo: 1,
          estado: false,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
        {
          id: 6,
          nombre: 'Espera',
          descripcion: 'Mientras se asigna un asesor',
          tipo: 1,
          estado: true,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
        {
          id: 7,
          nombre: 'Bienvenida',
          descripcion: 'Mensaje al iniciar sesión de chat',
          tipo: 1,
          estado: true,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
        // Correo - tipo: 2
        {
          id: 8,
          nombre: 'Finalización',
          descripcion: 'Al resolver la consulta',
          tipo: 2,
          estado: false,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
        {
          id: 9,
          nombre: 'Fuera de Horario',
          descripcion: 'Respuesta fuera del horario laboral',
          tipo: 2,
          estado: true,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
        {
          id: 10,
          nombre: 'Confirmación Recibido',
          descripcion: 'Auto-respuesta al recibir email',
          tipo: 2,
          estado: true,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
        // WhatsApp - tipo: 3
        {
          id: 11,
          nombre: 'Finalización',
          descripcion: 'Al completar interacción',
          tipo: 3,
          estado: true,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
        {
          id: 12,
          nombre: 'Fuera de Horario',
          descripcion: 'Mensaje nocturno/fines de semana',
          tipo: 3,
          estado: false,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
        {
          id: 13,
          nombre: 'Transferencia Humano',
          descripcion: 'Al escalar a agente humano',
          tipo: 3,
          estado: false,
          updatedAt: new Date(),
          createdAt: new Date(),
        },

        {
          id: 14,
          nombre: 'Bienvenida IA',
          descripcion: 'Primer contacto con bot inteligente',
          tipo: 3,
          estado: true,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
        // Telegram - tipo: 4
        {
          id: 15,
          nombre: 'Finalización',
          descripcion: 'Al completar interacción',
          tipo: 4,
          estado: true,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
        {
          id: 16,
          nombre: 'Fuera de Horario',
          descripcion: 'Mensaje nocturno/fines de semana',
          tipo: 4,
          estado: false,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
        {
          id: 17,
          nombre: 'Transferencia Humano',
          descripcion: 'Al escalar a agente humano',
          tipo: 4,
          estado: false,
          updatedAt: new Date(),
          createdAt: new Date(),
        },

        {
          id: 18,
          nombre: 'Bienvenida IA',
          descripcion: 'Primer contacto con bot inteligente',
          tipo: 4,
          estado: true,
          updatedAt: new Date(),
          createdAt: new Date(),
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
