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
          category_id: 1,
          status: true,
          created_at: new Date(),
          updated_at: new Date(),   
        },
        {
          id: 2,
          name: 'Agente Ocupado',
          category_id: 1,
          status: false,
          updated_at: new Date(),
          created_at: new Date(),
        },
        {
          id: 3,
          name: 'Fuera de Horario',
          category_id: 1,
          status: true,
          updated_at: new Date(),
          created_at: new Date(),
        },
        {
          id: 4,
          name: 'Finalización',
          category_id: 1,
          status: false,
          updated_at: new Date(),
          created_at: new Date(),
        },
        {
          id: 5,
          name: 'Transferencia',
          category_id: 1,
          status: false,
          updated_at: new Date(),
          created_at: new Date(),
        },
        {
          id: 6,
          name: 'Espera',
          category_id: 1,
          status: true,
          updated_at: new Date(),
          created_at: new Date(),
        },
        {
          id: 7,
          name: 'Bienvenida',
          category_id: 1,
          status: true,
          updated_at: new Date(),
          created_at: new Date(),
        },
        // Correo - category_id: 2
        {
          id: 8,
          name: 'Finalización',
          category_id: 2,
          status: false,
          updated_at: new Date(),
          created_at: new Date(),
        },
        {
          id: 9,
          name: 'Fuera de Horario',
          category_id: 2,
          status: true,
          updated_at: new Date(),
          created_at: new Date(),
        },
        {
          id: 10,
          name: 'Confirmación Recibido',
          category_id: 2,
          status: true,
          updated_at: new Date(),
          created_at: new Date(),
        },
        // WhatsApp - category_id: 3
        {
          id: 11,
          name: 'Finalización',
          category_id: 3,
          status: true,
          updated_at: new Date(),
          created_at: new Date(),
        },
        {
          id: 12,
          name: 'Fuera de Horario',
          category_id: 3,
          status: false,
          updated_at: new Date(),
          created_at: new Date(),
        },
        {
          id: 13,
          name: 'Transferencia Humano',
          category_id: 3,
          status: false,
          updated_at: new Date(),
          created_at: new Date(),
        },

        {
          id: 14,
          name: 'Bienvenida IA',
          category_id: 3,
          status: true,
          updated_at: new Date(),
          created_at: new Date(),
        },
        // Telegram - category_id: 4
        {
          id: 15,
          name: 'Finalización',
          category_id: 4,
          status: true,
          updated_at: new Date(),
          created_at: new Date(),
        },
        {
          id: 16,
          name: 'Fuera de Horario',
          category_id: 4,
          status: false,
          updated_at: new Date(),
          created_at: new Date(),
        },
        {
          id: 17,
          name: 'Transferencia Humano',
          category_id: 4,
          status: false,
          updated_at: new Date(),
          created_at: new Date(),
        },

        {
          id: 18,
          name: 'Bienvenida IA',
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
