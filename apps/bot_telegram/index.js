const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const axios = require("axios");

dotenv.config();

const TOKEN = process.env.TOKEN;
const bot = new TelegramBot(TOKEN, { polling: true });
const CHAT_ID = process.env.CHAT_ID; // tu chat de pruebas si quieres usarlo
const userStates = {};

// Datos de empresa por país
const dataCompanyByCountry = {
    España: {
        Delta: { name: "Delta Chemical Enterprise Sl", urlGoogleMaps: "https://www.google.com/maps/place/delta+chemical/..." },
        Elite: { name: "Elite Chemical Industries SL", urlGoogleMaps: "https://www.google.com/maps/place/ELITE+CHEMICAL+INDUSTRIES+SL/..." },
        Prisma: { name: "Prisma Universe SL", urlGoogleMaps: "https://www.google.com/maps/place/Prisma+Universe+S.L./..." },
        Ablue: { name: "Ablue Spain SL", urlGoogleMaps: "https://www.google.com/maps/place/Ablue+Spain+SL/..." },
        Alquimia: { name: "Alquimia Spain Sl", urlGoogleMaps: "https://www.google.com/maps/place/Alquimia+Spain/..." },
        Omega: { name: "Omega Consumibles Informaticos SL", urlGoogleMaps: "https://www.google.com/maps/place/Omega+Consultoría+Informática/..." }
    },
    Francia: {
        Delta: { name: "Delta Chemical Sarl", urlGoogleMaps: "https://www.google.com/maps/place/SARL+Delta+Chemical/..." },
        Elite: { name: "Elite Chemical France", urlGoogleMaps: "https://www.google.com/maps/place/Elite+Chemical+France/..." },
        Ablue: { name: "Atlantic France Sarl", urlGoogleMaps: "https://www.google.com/maps/place/23+Av.+Georges+Guynemer/..." }
    },
    Portugal: {
        Delta: { name: "Delta Chemical Enterprise Sl", urlGoogleMaps: "https://www.google.com/maps/place/delta+chemical/..." },
        Elite: { name: "Elite Chemical Industries SL", urlGoogleMaps: "https://www.google.com/maps/place/ELITE+CHEMICAL+INDUSTRIES+SL/..." },
        Alquimia: { name: "Alquimia Spain Sl", urlGoogleMaps: "https://www.google.com/maps/place/Alquimia+Spain/..." },
        Ablue: { name: "Ablue Spain SL", urlGoogleMaps: "https://www.google.com/maps/place/Ablue+Spain+SL/..." }
    }
};

// --- Comando inicial ---
bot.onText(/\/reseña/, (msg) => {
    const chatId = msg.chat.id;
    userStates[chatId] = { step: 'pais', data: {} };

    bot.sendMessage(chatId, '🌍 Elige un país:', {
        reply_markup: {
            inline_keyboard: [
                [{ text: '🇪🇸 España', callback_data: 'pais:España' }],
                [{ text: '🇫🇷 Francia', callback_data: 'pais:Francia' }],
                [{ text: '🇵🇹 Portugal', callback_data: 'pais:Portugal' }]
            ]
        }
    });
});

// --- Manejo de callback_query ---
bot.on('callback_query', (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    // Siempre responder para que el botón no desaparezca
    bot.answerCallbackQuery(callbackQuery.id);

    // Botones finales
    if (['accept', 'reject', 'regenerate'].includes(data)) {
        let responseText = '';
        if (data === 'accept') responseText = '✅ Has aceptado la reseña.';
        else if (data === 'reject') responseText = '❌ Has rechazado la reseña.';
        else if (data === 'regenerate') responseText = '🔄 Has solicitado regenerar la reseña.';

        bot.editMessageReplyMarkup({ inline_keyboard: [] }, {
            chat_id: chatId,
            message_id: callbackQuery.message.message_id
        });

        bot.sendMessage(chatId, responseText);
        return;
    }

    if (!userStates[chatId]) return;
    const state = userStates[chatId];

    // --- Selección de país ---
    if (data.startsWith('pais:')) {
        const pais = data.split(':')[1];
        state.data.pais = pais;
        state.step = 'empresa';

        const empresas = Object.keys(dataCompanyByCountry[pais] || {});
        const buttons = empresas.map(e => [{ text: e, callback_data: `empresa:${e}` }]);

        bot.editMessageText(`✅ País seleccionado: ${pais}\n\nAhora elige la empresa:`, {
            chat_id: chatId,
            message_id: callbackQuery.message.message_id,
            reply_markup: { inline_keyboard: buttons }
        });
        return;
    }

    // --- Selección de empresa ---
    if (data.startsWith('empresa:')) {
        const empresa = data.split(':')[1];
        state.data.empresa = empresa;
        state.step = 'estrellas';

        const empresaData = dataCompanyByCountry[state.data.pais][empresa];
        state.data.urlGoogleMaps = empresaData.urlGoogleMaps;
        state.data.name = empresaData.name;

        bot.editMessageText(`✅ Empresa seleccionada: ${empresa}\n\n¿Cuántas estrellas quieres poner? (1-5, o deja vacío para random)`, {
            chat_id: chatId,
            message_id: callbackQuery.message.message_id
        });
        return;
    }
});

// --- Manejo de mensajes libres ---
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    if (!userStates[chatId]) return;
    const state = userStates[chatId];

    // Ignorar el comando inicial
    if (!msg.text || msg.text.startsWith('/reseña')) return;

    if (state.step === 'estrellas') {
        let estrellas = parseInt(msg.text);
        if (isNaN(estrellas) || estrellas < 1 || estrellas > 5) {
            estrellas = Math.floor(Math.random() * 5) + 1;
        }
        state.data.estrellas = estrellas;
        state.step = 'extra';

        bot.sendMessage(chatId, '📝 ¿Quieres añadir algo extra al prompt? (ejemplo: mencionar a un comercial). Si no, escribe "-"');
    } else if (state.step === 'extra') {
        const extra = msg.text === '-' ? '' : msg.text;
        state.data.extra = extra;
        state.step = 'done';

        const reseñaData = state.data;

        bot.sendMessage(chatId, `📋 Datos recogidos:\n\n` +
            `🌍 País: <b>${reseñaData.pais}</b>\n` +
            `🏢 Empresa: <b>${reseñaData.empresa}</b>\n` +
            `⭐ Estrellas: <b>${reseñaData.estrellas}</b>\n` +
            `📝 Extra: <b>${reseñaData.extra || 'Ninguno'}</b>`, { parse_mode: 'HTML' });

        try {
            const response = await axios.post("http://localhost:3000/bot/generate-review", {
                infoEmpresa: reseñaData.empresa,
                urlGoogleMaps: reseñaData.urlGoogleMaps,
                pais: reseñaData.pais,
                extra: reseñaData.extra
            });
            console.log("Respuesta del servidor de reseñas:", response.data);

            const reviewText = response.data.review || "⚠️ No se generó la reseña";

            await bot.sendMessage(chatId,
                `📋 Datos recogidos:\n` +
                `🌍 País: <b>${reseñaData.pais}</b>\n` +
                `🏢 Empresa: <b>${reseñaData.empresa}</b>\n` +
                `⭐ Estrellas: <b>${reseñaData.estrellas}</b>\n` +
                `📝 Extra: <b>${reseñaData.extra || 'Ninguno'}</b>\n\n` +
                `✍️ Reseña generada:\n\n${reviewText}`,
                { parse_mode: 'HTML' }
            );

            // Botones finales
            await bot.sendMessage(chatId, "¿Qué quieres hacer con esta reseña?", {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: 'Aceptar ✅', callback_data: 'accept' },
                            { text: 'Rechazar ❌', callback_data: 'reject' },
                            { text: 'Regenerar 🔄', callback_data: 'regenerate' }
                        ]
                    ]
                }
            });
        } catch (err) {
            console.error("Error generando reseña:", err.message);
            bot.sendMessage(chatId, "⚠️ Error al generar la reseña. Intenta más tarde.");
        }
        delete userStates[chatId];
    }
});