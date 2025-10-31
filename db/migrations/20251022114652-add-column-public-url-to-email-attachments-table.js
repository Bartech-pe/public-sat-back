'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('email_attachments', 'public_url', {
      type: Sequelize.TEXT('long'),
      allowNull: true,
      comment: 'Ruta del archivo adjunto',
    });
    await queryInterface.addColumn('email_attachments', 'cid', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Content ID del archivo adjunto',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('email_attachments', 'public_url');
    await queryInterface.removeColumn('email_attachments', 'cid');
  },
};
