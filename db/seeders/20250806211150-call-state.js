'use strict';

const { CreatedAt } = require('sequelize-typescript');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('call-state',[
       {
          callStateId: 1,
          name: 'Concluida',
          icon: 'mdi:check-circle',
          style:'text-green-600',
          createdAt: new Date(),
          updatedAt: new Date()
       },
       {
          callStateId: 2,
          name: 'Abandonado',
          icon: 'mdi:close-circle',
          style:'text-red-600',
          createdAt: new Date(),
          updatedAt: new Date()
       },
       {
          callStateId: 3,
          name: 'Escalado',
          icon: 'mdi:arrow-up-circle',
          style:'text-yellow-600',
          createdAt: new Date(),
          updatedAt: new Date()
       },
        {
          callStateId: 4,
          name: 'En llamada',
          icon: 'mdi:phone',
          style:'text-red-600',
          createdAt: new Date(),
          updatedAt: new Date()
       },
        {
          callStateId: 5,
          name: 'En Linea',
          icon: 'mdi:account-check',
          style:'text-green-600',
          createdAt: new Date(),
          updatedAt: new Date()
       },
        {
          callStateId: 6,
          name: 'Ocupado',
          icon: 'mdi:circle-on',
          style:'text-yellow-600',
          createdAt: new Date(),
          updatedAt: new Date()
       },
        {
          callStateId: 7,
          name: 'Fuera de Linea',
          icon: 'mdi:account-cancel',
          style:'text-600',
          createdAt: new Date(),
          updatedAt: new Date()
       }
    ])
  }
}