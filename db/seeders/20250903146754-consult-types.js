'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('consult_types', [
      {
        id: 1,
        code: '01',
        name: 'Predial',
        created_by: 1,
        updated_by: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        code: '02',
        name: 'Vehicular',
        created_by: 1,
        updated_by: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 3,
        code: '03',
        name: 'Alcabala',
        created_by: 1,
        updated_by: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 4,
        code: '04',
        name: 'Facilidades tributarias',
        created_by: 1,
        updated_by: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 5,
        code: '05',
        name: 'Papeletas',
        created_by: 1,
        updated_by: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 6,
        code: '06',
        name: 'Multa administrativa',
        created_by: 1,
        updated_by: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 7,
        code: '07',
        name: 'Compromiso de pago',
        created_by: 1,
        updated_by: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 8,
        code: '08',
        name: 'Procedimiento sancionador',
        created_by: 1,
        updated_by: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 9,
        code: '09',
        name: 'Revisión papeleta',
        created_by: 1,
        updated_by: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 10,
        code: '10',
        name: 'Prescripción papeleta',
        created_by: 1,
        updated_by: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 11,
        code: '11',
        name: 'Consulta trámite',
        created_by: 1,
        updated_by: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 12,
        code: '12',
        name: 'Consulta coactiva',
        created_by: 1,
        updated_by: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 13,
        code: '13',
        name: 'Otra entidad',
        created_by: 1,
        updated_by: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 14,
        code: '14',
        name: 'Retención bancaria',
        created_by: 1,
        updated_by: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 15,
        code: '15',
        name: 'Agencia virtual',
        created_by: 1,
        updated_by: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 16,
        code: '16',
        name: 'Otras consultas',
        created_by: 1,
        updated_by: 1,
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
