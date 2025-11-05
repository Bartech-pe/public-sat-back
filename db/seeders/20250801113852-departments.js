'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'departments',
      [
        {
          id: 1,
          name: 'Subgerencia de Orientación y Registro (SOR)',
          description: 'Subgerencia de Orientación y Registro (SOR)',
          inmutable: true,
          status: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 2,
          name: 'Subgerencia de gestión de cobranzas - Tributaria',
          description: 'Subgerencia de gestión de cobranzas - Tributaria',
          inmutable: false,
          status: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 3,
          name: 'Subgerencia de gestión de cobranzas - No Tributaria',
          description: 'Subgerencia de gestión de cobranzas - No Tributaria',
          inmutable: false,
          status: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 4,
          name: 'Subgerencia de ejecución coactiva - Tributaria',
          description: 'Subgerencia de ejecución coactiva - Tributaria',
          inmutable: false,
          status: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 5,
          name: 'Subgerencia de ejecución coactiva - No Tributaria',
          description: 'Subgerencia de ejecución coactiva - No Tributaria',
          inmutable: false,
          status: true,
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
