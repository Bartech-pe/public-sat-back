'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('template_emails', [
      {
        id: 1,
        name: 'Nueva plantilla promocion',
        template: `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Plantilla SAT</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .highlight-box {
            background: linear-gradient(to right, #f5f7fa 50%, #ffffff 50%);
        }
        .banner-text {
            font-family: Arial, sans-serif;
            font-weight: bold;
            text-transform: uppercase;
        }
    </style>
</head>
<body class="bg-gray-100">
    <div class="max-w-4xl mx-auto bg-white p-6 shadow-lg">
        <div class="flex justify-between items-center mb-4">
            <img src="https://yt3.googleusercontent.com/69DIZ4mbbRAVbbQOkW_wk947UtDKypv1kakJL63gUhTOvsRDA9if3BNlEZnOatlIt0qljhceBg=s900-c-k-c0x00ffffff-no-rj" alt="SAT Logo" class="h-10">
            <div class="text-sm text-gray-600">
                <span>NOMBRE DE CONTRIBUYENTE: [NOMBRE]</span>
            </div>
        </div>
        <hr class="mb-4 border-gray-200">
        <p class="text-gray-700 mb-4">
            Estimado contribuyente <span class="font-semibold">[NAME]</span>, el SAT de Lima le informa, que mantiene DEUDA POR IMPUESTO PREDIAL Y/O ARBITRIOS. Cumpla con sus obligaciones tributarias y evite acciones de COBRA. Espere más y evite pagar intereses y recargos.
        </p>
        <p class="text-gray-700 mb-4">
            Puede realizar sus pagos a través de los aplicativos de los bancos, agentes, y/o por la página web dando click en el siguiente enlace: <a href="#" class="text-indigo-600 underline">www.sat.gob.pe/pagosonlinea</a>
        </p>
        <p class="text-gray-700 mb-4">
            Para mayor información y/o solicitar su estado de cuenta comuníquese con el equipo [CORREO] mediante la plataforma WHATSAPP al [CELULAR].
        </p>
        <div class="highlight-box p-6 mb-4">
            <div class="text-center">
                <img src="https://www.sat.gob.pe/websitev9/LinkClick.aspx?fileticket=-KJMu_aypw8%253d&portalid=0" alt="SAT Servicio" class="mx-auto mb-4">
                <div class="banner-text text-white bg-yellow-400 inline-block px-4 py-2 rounded-tl-lg rounded-br-lg">
                    <span class="text-2xl text-blue-900">¡QUE TIEMPO NO TE GANE!</span><br>
                    <span class="text-3xl text-blue-900">PAGÁ HOY</span><br>
                    <span class="text-2xl text-blue-900">TUS TRIBUTOS</span>
                </div>
            </div>
        </div>
        <div class="text-center text-gray-500 text-sm mt-4">
            <p>Servicio de Administración Tributaria de Lima</p>
        </div>
    </div>
</body>
</html>`,
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
        name: 'Plantilla dos con variables',
        template: `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Plantilla SAT</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .highlight-box {
            background: linear-gradient(to right, #f5f7fa 50%, #ffffff 50%);
        }
        .banner-text {
            font-family: Arial, sans-serif;
            font-weight: bold;
            text-transform: uppercase;
        }
    </style>
</head>
<body class="bg-gray-100">
    <div class="max-w-4xl mx-auto bg-white p-6 shadow-lg">
        <div class="flex justify-between items-center mb-4">
            <img src="https://yt3.googleusercontent.com/69DIZ4mbbRAVbbQOkW_wk947UtDKypv1kakJL63gUhTOvsRDA9if3BNlEZnOatlIt0qljhceBg=s900-c-k-c0x00ffffff-no-rj" alt="SAT Logo" class="h-10">
            <div class="text-sm text-gray-600">
                <span>CÓDIGO DE CONTRIBUYENTE: [CODE]</span>
            </div>
        </div>
        <hr class="mb-4 border-gray-200">
        <p class="text-gray-700 mb-4">
            Estimado contribuyente <span class="font-semibold">[NAME]</span>, el SAT de Lima le informa, que mantiene DEUDA POR IMPUESTO PREDIAL Y/O ARBITRIOS. Cumpla con sus obligaciones tributarias y evite acciones de COBRA. Espere más y evite pagar intereses y recargos.
        </p>
        <p class="text-gray-700 mb-4">
            Puede realizar sus pagos a través de los aplicativos de los bancos, agentes, y/o por la página web dando click en el siguiente enlace: <a href="#" class="text-indigo-600 underline">www.sat.gob.pe/pagosonlinea</a>
        </p>
        <p class="text-gray-700 mb-4">
            Para mayor información y/o solicitar su estado de cuenta comuníquese con el equipo [VAR1] mediante la plataforma WHATSAPP al [VAR2].
        </p>
        <div class="highlight-box p-6 mb-4">
            <div class="text-center">
                <img src="https://www.sat.gob.pe/websitev9/LinkClick.aspx?fileticket=-KJMu_aypw8%253d&portalid=0" alt="SAT Servicio" class="mx-auto mb-4">
                <div class="banner-text text-white bg-yellow-400 inline-block px-4 py-2 rounded-tl-lg rounded-br-lg">
                    <span class="text-2xl text-blue-900">¡QUE TIEMPO NO TE GANE!</span><br>
                    <span class="text-3xl text-blue-900">PAGÁ HOY</span><br>
                    <span class="text-2xl text-blue-900">TUS TRIBUTOS</span>
                </div>
            </div>
        </div>
        <div class="text-center text-gray-500 text-sm mt-4">
            <p>Servicio de Administración Tributaria de Lima</p>
        </div>
    </div>
</body>
</html>`,
        status: 1,
        created_by: 1,
        updated_by: 1,
        deleted_by: null,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
      {
        id: 3,
        name: 'Plantilla tres con variables',
        template: `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Plantilla SAT</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .highlight-box {
            background: linear-gradient(to right, #f5f7fa 50%, #ffffff 50%);
        }
        .banner-text {
            font-family: Arial, sans-serif;
            font-weight: bold;
            text-transform: uppercase;
        }
    </style>
</head>
<body class="bg-gray-100">
    <div class="max-w-4xl mx-auto bg-white p-6 shadow-lg">
        <div class="flex justify-between items-center mb-4">
            <img src="https://yt3.googleusercontent.com/69DIZ4mbbRAVbbQOkW_wk947UtDKypv1kakJL63gUhTOvsRDA9if3BNlEZnOatlIt0qljhceBg=s900-c-k-c0x00ffffff-no-rj" alt="SAT Logo" class="h-10">
            <div class="text-sm text-gray-600">
                <span>CÓDIGO DE CONTRIBUYENTE: [CODE]</span>
            </div>
        </div>
        <hr class="mb-4 border-gray-200">
        <p class="text-gray-700 mb-4">
            Estimado contribuyente <span class="font-semibold">[NAME]</span>, el SAT de Lima le informa, que mantiene DEUDA POR IMPUESTO PREDIAL Y/O ARBITRIOS. Cumpla con sus obligaciones tributarias y evite acciones de COBRA. Espere más y evite pagar intereses y recargos.
        </p>
        <p class="text-gray-700 mb-4">
            Puede realizar sus pagos a través de los aplicativos de los bancos, agentes, y/o por la página web dando click en el siguiente enlace: <a href="#" class="text-indigo-600 underline">www.sat.gob.pe/pagosonlinea</a>
        </p>
        <p class="text-gray-700 mb-4">
            Para mayor información y/o solicitar su estado de cuenta comuníquese con el equipo [VAR1] mediante la plataforma WHATSAPP al [VAR2].
        </p>
        <div class="highlight-box p-6 mb-4">
            <div class="text-center">
                <img src="https://www.sat.gob.pe/websitev9/LinkClick.aspx?fileticket=-KJMu_aypw8%253d&portalid=0" alt="SAT Servicio" class="mx-auto mb-4">
                <div class="banner-text text-white bg-yellow-400 inline-block px-4 py-2 rounded-tl-lg rounded-br-lg">
                    <span class="text-2xl text-blue-900">¡QUE TIEMPO NO TE GANE!</span><br>
                    <span class="text-3xl text-blue-900">PAGÁ HOY</span><br>
                    <span class="text-2xl text-blue-900">TUS TRIBUTOS</span>
                </div>
            </div>
        </div>
        <div class="text-center text-gray-500 text-sm mt-4">
            <p>Servicio de Administración Tributaria de Lima</p>
        </div>
    </div>
</body>
</html>`,
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
    await queryInterface.bulkDelete('template_emails', null, {});
  },
};
