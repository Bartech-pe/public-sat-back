'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'inbox_credentials',
      [
        {
          inbox_id: 1,
          access_token:
            'EAAJ7ZBAJqfAMBPHcoe2Uail1H6ZBF53nh7SZBBV9ANH1mkZAQ88EjnLQr3QZC3ZAUWrA0aMm534o0fZBPZAqOeQjlRPSJqExd2RLmZCSp53VPlvo8ZCIJXsuJJj621eZAw9WBCIKZBWX9lkXOZBSeKO7ZBRaZARkea5CnEp3cq7YcVQ1CwPU9lWZBCfc3pPZAUgdEpOkN',
          phone_number_id: '717763261413482',
          business_id: '694171840072155',
          phone_number: '15551649085',
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
