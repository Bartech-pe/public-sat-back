'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('campaign_schedules', [
      {
        id: 1,
        interval_days: '1-5',
        start_time: '08:00',
        end_time: '20:00',
        status: 1,
        created_by: 1,
        updated_by: 1,
        deleted_by: null,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        id: 2,
        interval_days: '6-6',
        start_time: '09:00',
        end_time: '18:00',
        status: 1,
        created_by: 1,
        updated_by: 1,
        deleted_by: null,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('campaign_schedules', null, {});
  },
};
