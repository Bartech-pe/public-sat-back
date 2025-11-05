'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'oficinas',
      [
        {
          id: 1,
          name: 'AloSAT',
          description: 'AloSAT',
          idArea: 1,
          inmutable: false,
          status: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'MEPECOS',
          description: 'MEPECOS',
          idArea: 2,
          inmutable: false,
          status: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          name: 'PRICOS',
          description: 'PRICOS',
          idArea: 2,
          inmutable: false,
          status: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 4,
          name: 'Subgerencia de gestión de cobranzas - No Tributaria',
          description: 'Subgerencia de gestión de cobranzas - No Tributaria',
          idArea: 3,
          inmutable: false,
          status: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 5,
          name: 'Subgerencia de ejecución coactiva - Tributaria',
          description: 'Subgerencia de ejecución coactiva - Tributaria',
          idArea: 4,
          inmutable: false,
          status: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 6,
          name: 'Subgerencia de ejecución coactiva - No Tributaria',
          description: 'Subgerencia de ejecución coactiva - No Tributaria',
          idArea: 5,
          inmutable: false,
          status: true,
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
