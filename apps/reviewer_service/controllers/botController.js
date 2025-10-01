const { GoogleGenerativeAI } = require('@google/generative-ai');
const { setUpScraper } = require('../utils/index');
const dotenv = require('dotenv');
dotenv.config();
const GEMINI_API = process.env.GEMINI_API;
const axios = require('axios');

// Puppeteer initialization
const puppeteer = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');
const solveCaptchas = require('puppeteer-extra-plugin-recaptcha');
puppeteer.use(pluginStealth());
// puppeteer.use(solveCaptchas());
// Use '-h' arg for headful login.
const headless = !process.argv.includes('-h');

const BotController = {
  generateReview: async (req, res) => {
    const { infoEmpresa, urlGoogleMaps } = req.body;
    try {
      // // Gemini Api initialization
      // const genAI = new GoogleGenerativeAI(GEMINI_API);
      // // Model initialization
      // const modelId = "gemini-1.5-flash";
      // const model = genAI.getGenerativeModel({ model: modelId });

      // const prompt = `Genera una reseña positiva en español sobre la empresa. La reseña debe enfocarse en la calidad del producto y el servicio, mencionando el uso real de los productos o servicios ofrecidos (Son productos quimicos de mantenimiento, jabones, taladrinas, grasas etc), escrita como si fuera un cliente satisfecho que cuenta su experiencia personal. Evita frases genéricas o indicaciones para completar, y que la reseña tenga menos de 100 palabras la reseña debe parecerse a una reseña real de un cliente satisfecho que no tenga que intercalar ningun nombre de empresa o producto no se debe hacer referencia al nombre de la empresa o el nombre del producto solo a la calidad del producto y el servicio.
      // `;

      // const chat = model.startChat({
      //   generationConfig: {
      //     maxOutputTokens: 100,
      //   },
      // });

      // const result = await chat.sendMessage(prompt);
      // const response = await result.response;
      // const review = response.text();
      // try {
      //   // Send to telegram bot
      //   axios.post("http://localhost:3001/notify", {
      //     target: "Elite Chemical Industries SL",
      //     mail: "arian.collaso.rodriguez@gmail.com",
      //     text_review: review,
      //   });
      // } catch (error) {
      //   console.log("No se ha podido mandar el mensaje al bot");
      // }

      setUpScraper(
        'https://accounts.google.com/signin/v2/identifier',
        false,
        urlGoogleMaps,
      ); // Este metodo, se logea y hará la tarea de colocar el review

      res.status(200).json({
        message: 'Review generated successfully',
        review: 'Review generated successfully',
      });
    } catch (error) {
      res.status(500).json({
        message: 'Internal server error',
        error: error.message,
      });
    }
  },
};

module.exports = {
  BotController,
};
