'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('call_states', [
      {
        id: 1,
        name: 'Concluida',
        icon: 'mdi:check-circle',
        style: 'text-green-600',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        name: 'Abandonado',
        icon: 'mdi:close-circle',
        style: 'text-red-600',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 3,
        name: 'Escalado',
        icon: 'mdi:arrow-up-circle',
        style: 'text-yellow-600',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 4,
        name: 'En llamada',
        icon: 'mdi:phone',
        style: 'text-red-600',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 5,
        name: 'En Linea',
        icon: 'mdi:account-check',
        style: 'text-green-600',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 6,
        name: 'Ocupado',
        icon: 'mdi:circle-on',
        style: 'text-yellow-600',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 7,
        name: 'Fuera de Linea',
        icon: 'mdi:account-cancel',
        style: 'text-600',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
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
