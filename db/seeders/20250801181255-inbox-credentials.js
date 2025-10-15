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
            'EAAKsWt4pKcsBPRaqXYC49D4XaADhfXynXA8heQzN6bxFG9ZBOKSzYARFY0NUaZAhGh9RXVIzmx2ro2WeEDHEVgu1rBXJNSSyw8mbQlgIiVrCEoqBUOyBS8IZCQaZA9sKfawxDNCIQVM9vRZAlcsoZCspdiCBxaAHwxicBEmUxgQHY0PZBceVfrLSDY1xYBCAJIxYgZDZD',
          phone_number_id: '798175103382213',
          business_id: '1712995006081848',
          phone_number: '15551867428',
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
