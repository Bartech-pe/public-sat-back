'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'campaign_states',
      [
        {
          id: 1,
          name: 'Finalizada',
          description: 'Campaña completada',
          status: true,
          color: '#0f0f0e',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 2,
          name: 'Pausada',
          description: 'Campaña temporariamente pausada',
          status: false,
          color: '#d16928ff',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 3,
          name: 'Programada',
          description: 'Campaña creada, pendiente de inicio',
          status: true,
          color: '#2860d1',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 4,
          name: 'Activa',
          description: 'Campaña en ejecución',
          status: true,
          color: '#15ff00',
          created_at: new Date(),
          updated_at: new Date(),
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
