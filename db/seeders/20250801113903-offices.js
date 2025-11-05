'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'offices',
      [
        {
          id: 1,
          name: 'AloSAT',
          description: 'AloSAT',
          department_id: 1,
          inmutable: false,
          status: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 2,
          name: 'MEPECOS',
          description: 'MEPECOS',
          department_id: 2,
          inmutable: false,
          status: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 3,
          name: 'PRICOS',
          description: 'PRICOS',
          department_id: 2,
          inmutable: false,
          status: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 4,
          name: 'Subgerencia de gestión de cobranzas - No Tributaria',
          description: 'Subgerencia de gestión de cobranzas - No Tributaria',
          department_id: 3,
          inmutable: false,
          status: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 5,
          name: 'Subgerencia de ejecución coactiva - Tributaria',
          description: 'Subgerencia de ejecución coactiva - Tributaria',
          department_id: 4,
          inmutable: false,
          status: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 6,
          name: 'Subgerencia de ejecución coactiva - No Tributaria',
          description: 'Subgerencia de ejecución coactiva - No Tributaria',
          department_id: 5,
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
