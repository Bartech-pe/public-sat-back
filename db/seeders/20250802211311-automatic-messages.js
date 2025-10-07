'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'automatic_messages',
      [
        // ChatSAT - category_id: 1
        {
          id: 1,
          name: 'Error/TimeOut',
          description: 'Problemas técnicos',
          category_id: 1,
          status: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 2,
          name: 'Agente Ocupado',
          description: 'Sin asesores disponibles',
          category_id: 1,
          status: false,
          updated_at: new Date(),
          created_at: new Date(),
        },
        {
          id: 3,
          name: 'Fuera de Horario',
          description: 'Cuando SAT está cerrado',
          category_id: 1,
          status: true,
          updated_at: new Date(),
          created_at: new Date(),
        },
        {
          id: 4,
          name: 'Finalización',
          description: 'Al cerrar la conversación',
          category_id: 1,
          status: false,
          updated_at: new Date(),
          created_at: new Date(),
        },
        {
          id: 5,
          name: 'Transferencia',
          description: 'Al transferir a especialista',
          category_id: 1,
          status: false,
          updated_at: new Date(),
          created_at: new Date(),
        },
        {
          id: 6,
          name: 'Espera',
          description: 'Mientras se asigna un asesor',
          category_id: 1,
          status: true,
          updated_at: new Date(),
          created_at: new Date(),
        },
        {
          id: 7,
          name: 'Bienvenida',
          description: 'Mensaje al iniciar sesión de chat',
          category_id: 1,
          status: true,
          updated_at: new Date(),
          created_at: new Date(),
        },
        // Correo - category_id: 2
        {
          id: 8,
          name: 'Finalización',
          description: 'Al resolver la consulta',
          category_id: 2,
          status: false,
          updated_at: new Date(),
          created_at: new Date(),
        },
        {
          id: 9,
          name: 'Fuera de Horario',
          description: 'Respuesta fuera del horario laboral',
          category_id: 2,
          status: true,
          updated_at: new Date(),
          created_at: new Date(),
        },
        {
          id: 10,
          name: 'Confirmación Recibido',
          description: 'Auto-respuesta al recibir email',
          category_id: 2,
          status: true,
          updated_at: new Date(),
          created_at: new Date(),
        },
        // WhatsApp - category_id: 3
        {
          id: 11,
          name: 'Finalización',
          description: 'Al completar interacción',
          category_id: 3,
          status: true,
          updated_at: new Date(),
          created_at: new Date(),
        },
        {
          id: 12,
          name: 'Fuera de Horario',
          description: 'Mensaje nocturno/fines de semana',
          category_id: 3,
          status: false,
          updated_at: new Date(),
          created_at: new Date(),
        },
        {
          id: 13,
          name: 'Transferencia Humano',
          description: 'Al escalar a agente humano',
          category_id: 3,
          status: false,
          updated_at: new Date(),
          created_at: new Date(),
        },

        {
          id: 14,
          name: 'Bienvenida IA',
          description: 'Primer contacto con bot inteligente',
          category_id: 3,
          status: true,
          updated_at: new Date(),
          created_at: new Date(),
        },
        // Telegram - category_id: 4
        {
          id: 15,
          name: 'Finalización',
          description: 'Al completar interacción',
          category_id: 4,
          status: true,
          updated_at: new Date(),
          created_at: new Date(),
        },
        {
          id: 16,
          name: 'Fuera de Horario',
          description: 'Mensaje nocturno/fines de semana',
          category_id: 4,
          status: false,
          updated_at: new Date(),
          created_at: new Date(),
        },
        {
          id: 17,
          name: 'Transferencia Humano',
          description: 'Al escalar a agente humano',
          category_id: 4,
          status: false,
          updated_at: new Date(),
          created_at: new Date(),
        },

        {
          id: 18,
          name: 'Bienvenida IA',
          description: 'Primer contacto con bot inteligente',
          category_id: 4,
          status: true,
          updated_at: new Date(),
          created_at: new Date(),
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
