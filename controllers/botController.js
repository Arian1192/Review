const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();
const GEMINI_API = process.env.GEMINI_API;
console.log(GEMINI_API);
// Puppeteer initialization
const puppeteer = require("puppeteer-extra");
const pluginStealth = require("puppeteer-extra-plugin-stealth");
puppeteer.use(pluginStealth());
// Use '-h' arg for headful login.
const headless = !process.argv.includes("-h");

const BotController = {
  generateReview: async (req, res) => {
    const { infoEmpresa, urlGoogleMaps } = req.body;
    try {
      //       // Gemini Api initialization
      //       const genAI = new GoogleGenerativeAI(GEMINI_API);
      //       // Model initialization
      //       const modelId = "gemini-1.5-flash";
      //       const model = genAI.getGenerativeModel({ model: modelId });

      //       const prompt = `Genera una reseña positiva en español sobre la empresa. La reseña debe enfocarse en la calidad del producto y el servicio, mencionando el uso real de los productos o servicios ofrecidos (Son productos quimicos de mantenimiento, jabones, taladrinas, grasas etc), escrita como si fuera un cliente satisfecho que cuenta su experiencia personal. Evita frases genéricas o indicaciones para completar, y que la reseña tenga menos de 100 palabras la reseña debe parecerse a una reseña real de un cliente satisfecho que no tenga que intercalar ningun nombre de empresa o producto no se debe hacer referencia al nombre de la empresa o el nombre del producto solo a la calidad del producto y el servicio.
      // `;

      //       const chat = model.startChat({
      //         generationConfig: {
      //           maxOutputTokens: 100,
      //         },
      //       });

      //       const result = await chat.sendMessage(prompt);
      //       const response = await result.response;
      //       const review = response.text();

      puppeteer.launch({ headless: false }).then(async (browser) => {
        console.log("Opening browser ...");
        const page = await browser.newPage();
        const pages = await browser.pages();
        pages[0].close();
        await page.goto("https://accounts.google.com/signin/v2/identifier", {
          waitUntil: "networkidle2",
        });
        if (headless) {
          // Only needed if sign in requires you to click 'sign in with google' button.
          // await page.waitForSelector('button[data-test="google-button-login"]');
          // await page.waitFor(1000);
          // await page.click('button[data-test="google-button-login"]');

          // Wait for email input.
          await page.waitForSelector("#identifierId");
          let badInput = true;

          // Keep trying email until user inputs email correctly.
          // This will error due to captcha if too many incorrect inputs.
          while (badInput) {
            await page.type(
              "#identifierId",
              "arian.collaso.rodriguez@gmail.com"
            );
            await await page.waitForTimeout(1000);
            1000;
            await page.keyboard.press("Enter");
            await await page.waitForTimeout(1000);
            1000;
            badInput = await page.evaluate(
              () =>
                document.querySelector('#identifierId[aria-invalid="true"]') !==
                null
            );
            if (badInput) {
              console.log("Incorrect email or phone. Please try again.");
              await page.click("#identifierId", { clickCount: 3 });
            }
          }
          // Wait for password input
          // Esperar a que aparezca el input de contraseña
          await page.waitForSelector('input[type="password"]', {
            visible: true,
          });
          // Ahora tipeas la contraseña
          await page.type('input[type="password"]', "40S4r3dder!");
          await page.keyboard.press("Enter");
          // For headless mode, 2FA needs to be handled here.
          // Login via gmail app works autmatically.
        }
      });
      res.status(200).json({
        message: "Review generated successfully",
        review: "Review generated successfully",
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },
};

module.exports = {
  BotController,
};
