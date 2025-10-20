'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'channels',
      [
        {
          id: 1,
          name: 'telegram',
          description: 'Aplicación de mensajería',
          logo: 'logos:telegram',
          status: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 2,
          name: 'whatsapp',
          description: 'Aplicación de mensajería',
          logo: 'logos:whatsapp-icon',
          status: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 3,
          name: 'sms',
          description: 'Aplicación de mensajería',
          logo: 'flat-color-icons:sms',
          status: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 4,
          name: 'email',
          description: 'Aplicación de mensajería',
          logo: 'material-icon-theme:email',
          status: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 5,
          name: 'instagram',
          description: 'Aplicación de mensajería',
          logo: 'skill-icons:instagram',
          status: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 6,
          name: 'messenger',
          description: 'Aplicación de mensajería',
          logo: 'logos:messenger',
          status: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 7,
          name: 'chatsat',
          description: 'Aplicación de mensajería',
          logo: 'mdi:web',
          status: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 8,
          name: 'vicidial',
          description: 'Central de llamadas',
          logo: 'line-md:phone-call-twotone-loop',
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
