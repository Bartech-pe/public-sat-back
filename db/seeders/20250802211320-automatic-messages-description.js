'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'automatic_message_descriptions',
      [
        // ChatSAT - ID 1: Error/TimeOut
        {
          automatic_message_id: 1,
          description: 'Problemas técnicos',
          order: 1,
          status: true,
          created_at: new Date(),
          updated_at: new Date(),
        },

        // ChatSAT - ID 2: Agente Ocupado
        {
          automatic_message_id: 2,
          description: 'Sin asesores disponibles',
          order: 1,
          status: false,
          created_at: new Date(),
          updated_at: new Date(),
        },

        // ChatSAT - ID 3: Fuera de Horario
        {
          automatic_message_id: 3,
          description: 'Cuando SAT está cerrado',
          order: 1,
          status: true,
          created_at: new Date(),
          updated_at: new Date(),
        },

        // ChatSAT - ID 4: Finalización
        {
          automatic_message_id: 4,
          description: 'Al cerrar la conversación',
          order: 1,
          status: false,
          created_at: new Date(),
          updated_at: new Date(),
        },

        // ChatSAT - ID 5: Transferencia
        {
          automatic_message_id: 5,
          description: 'Al transferir a especialista',
          order: 1,
          status: false,
          created_at: new Date(),
          updated_at: new Date(),
        },

        // ChatSAT - ID 6: Espera
        {
          automatic_message_id: 6,
          description: 'Mientras se asigna un asesor',
          order: 1,
          status: true,
          created_at: new Date(),
          updated_at: new Date(),
        },

        // ChatSAT - ID 7: Bienvenida
        {
          automatic_message_id: 7,
          description: 'Mensaje al iniciar sesión de chat',
          order: 1,
          status: true,
          created_at: new Date(),
          updated_at: new Date(),
        },

        // Correo - ID 8: Finalización
        {
          automatic_message_id: 8,
          description: 'Al resolver la consulta',
          order: 1,
          status: false,
          created_at: new Date(),
          updated_at: new Date(),
        },

        // Correo - ID 9: Fuera de Horario
        {
          automatic_message_id: 9,
          description: 'Respuesta fuera del horario laboral',
          order: 1,
          status: true,
          created_at: new Date(),
          updated_at: new Date(),
        },

        // Correo - ID 10: Confirmación Recibido
        {
          automatic_message_id: 10,
          description: 'Auto-respuesta al recibir email',
          order: 1,
          status: true,
          created_at: new Date(),
          updated_at: new Date(),
        },

        // WhatsApp - ID 11: Finalización
        {
          automatic_message_id: 11,
          description: 'Al completar interacción',
          order: 1,
          status: true,
          created_at: new Date(),
          updated_at: new Date(),
        },

        // WhatsApp - ID 12: Fuera de Horario
        {
          automatic_message_id: 12,
          description: 'Mensaje nocturno/fines de semana',
          order: 1,
          status: false,
          created_at: new Date(),
          updated_at: new Date(),
        },

        // WhatsApp - ID 13: Transferencia Humano
        {
          automatic_message_id: 13,
          description: 'Al escalar a agente humano',
          order: 1,
          status: false,
          created_at: new Date(),
          updated_at: new Date(),
        },

        // WhatsApp - ID 14: Bienvenida IA
        {
          automatic_message_id: 14,
          description: 'Primer contacto con bot inteligente',
          order: 1,
          status: true,
          created_at: new Date(),
          updated_at: new Date(),
        },

        // Telegram - ID 15: Finalización
        {
          automatic_message_id: 15,
          description: 'Al completar interacción',
          order: 1,
          status: true,
          created_at: new Date(),
          updated_at: new Date(),
        },

        // Telegram - ID 16: Fuera de Horario
        {
          automatic_message_id: 16,
          description: 'Mensaje nocturno/fines de semana',
          order: 1,
          status: false,
          created_at: new Date(),
          updated_at: new Date(),
        },

        // Telegram - ID 17: Transferencia Humano
        {
          automatic_message_id: 17,
          description: 'Al escalar a agente humano',
          order: 1,
          status: false,
          created_at: new Date(),
          updated_at: new Date(),
        },

        // Telegram - ID 18: Bienvenida IA
        {
          automatic_message_id: 18,
          description: 'Primer contacto con bot inteligente',
          order: 1,
          status: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('automatic_message_descriptions', null, {});
  },
};