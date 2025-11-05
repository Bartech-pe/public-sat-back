'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('screens', [{
      name: 'Feriado',
      description: 'Pantalla de feriado',
      url: '/settings/feriado',
      icon: '',
      idParent: 21,
      status: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('screens', { url: '/settings/feriado' }, {});
  }
};