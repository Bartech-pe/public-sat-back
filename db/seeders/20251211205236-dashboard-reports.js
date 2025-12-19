'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    await queryInterface.bulkInsert(
      'dashboard_reports',
      [
        {
          dashboard_id: 38,
          name: 'AlóSat',
          description: 'Pantalla de reportes de AlóSat',
          type: 'metabase',
          status: true,
          created_at: now,
          updated_at: now,
        },
        {
          dashboard_id: 39,
          name: 'Por Hora',
          description: 'Pantalla de reportes de atenciones por hora',
          type: 'metabase',
          status: true,
          created_at: now,
          updated_at: now,
        },
        {
          dashboard_id: 46,
          name: 'Por IVR',
          description: 'Pantalla de reportes IVR',
          type: 'metabase',
          status: true,
          created_at: now,
          updated_at: now,
        },
        {
          dashboard_id: 37,
          name: 'Atenciones/No Atenciones',
          description: 'Pantalla de reportes de Atenciones/No Atenciones AlóSAT',
          type: 'metabase',
          status: true,
          created_at: now,
          updated_at: now,
        },
        {
          dashboard_id: 42,
          name: 'ChatSat/Wsp',
          description: 'Pantalla de reportes de ChatSat/Wsp',
          type: 'metabase',
          status: true,
          created_at: now,
          updated_at: now,
        },
        {
          dashboard_id: 33,
          name: 'Consolidado Atenciones',
          description: 'Pantalla de reportes Consolidado Atenciones',
          type: 'metabase',
          status: true,
          created_at: now,
          updated_at: now,
        },
        {
          dashboard_id: 41,
          name: 'Consolidado Consultas',
          description: 'Pantalla de reportes Consolidado Consultas',
          type: 'metabase',
          status: true,
          created_at: now,
          updated_at: now,
        },
        {
          dashboard_id: 36,
          name: 'Correo',
          description: 'Pantalla de reportes de Correo',
          type: 'metabase',
          status: true,
          created_at: now,
          updated_at: now,
        },
        {
          dashboard_id: 44,
          name: 'Encuesta Chat',
          description: 'Pantalla de reportes Encuesta Chat',
          type: 'metabase',
          status: true,
          created_at: now,
          updated_at: now,
        },
        {
          dashboard_id: 45,
          name: 'Campaña de Audio',
          description: 'Pantalla de reportes Campaña de Audio',
          type: 'metabase',
          status: true,
          created_at: now,
          updated_at: now,
        },
      ],
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('dashboard_reports', null, {});
  },
};
