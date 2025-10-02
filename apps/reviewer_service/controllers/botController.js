const { GoogleGenAI } = require('@google/genai');
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
const genAI = new GoogleGenAI({
  apiKey: GEMINI_API,
});
const BotController = {
  generateReview: async (req, res) => {
    const { infoEmpresa, urlGoogleMaps, pais, extra } = req.body;
    console.log("EXTRA RECIBIDO EN EL BACKEND: ", extra);
    let prompt = "";

    try {
      switch (pais) {
        case "España":
          prompt = `Genera una reseña positiva en español sobre la empresa. La reseña debe enfocarse en la calidad del producto y el servicio, mencionando el uso real de los productos o servicios ofrecidos (Son productos quimicos de mantenimiento, jabones, taladrinas, grasas etc), escrita como si fuera un cliente satisfecho que cuenta su experiencia personal. Evita frases genéricas o indicaciones para completar, y que la reseña tenga menos de 25 palabras la reseña debe parecerse a una reseña real de un cliente satisfecho que no tenga que intercalar ningun nombre de empresa o producto no se debe hacer referencia al nombre de la empresa o el nombre del producto solo a la calidad del producto y el servicio. Evita usar "Desde que uso sus productos queda muy generative AI" y por favor no tiene que ser "Sorprendente" o "Increible" solo una review sencilla por ultimo y mas importente utiliza ${extra} para incluirlo en la reseña si no es igual a - OJO NO PONGAS LO MISMO pero respeta el nombre, inventate algo usando esa variable por ejemplo si menciona a un comercial incluyelo en la reseña  `;
          break;
        case "Francia":
          prompt = `Générer un avis positif en français sur l'entreprise. L'avis doit se concentrer sur la qualité du produit et du service, en mentionnant l'utilisation réelle des produits ou services proposés (produits chimiques d'entretien, savons, liquides de coupe, graisses, etc.), rédigé comme s'il s'agissait d'un client satisfait partageant son expérience personnelle. Évitez les phrases ou instructions génériques à compléter, et l'avis doit faire moins de 25 mots. L'avis doit ressembler à un véritable avis d'un client satisfait et ne doit inclure aucun nom d'entreprise ou de produit. Le nom de l'entreprise ou du produit ne doit pas être référencé, seulement la qualité du produit et du service. Évitez d'utiliser « Depuis que j'utilise leurs produits, l'IA est devenue très générative » et s'il vous plaît, il n'est pas nécessaire que ce soit « Incroyable » ou « Incroyable », juste un avis simple enfin, mais surtout, utilisez ${extra} pour l'inclure dans l'avis s'il n'est pas égal à - ATTENTION NE METTEZ PAS LA MÊME CHOSE mais respectez le nom, inventez quelque chose en utilisant cette variable par exemple s'il mentionne un commercial, incluez-le dans l'avis `;
          break;
        case "Portugal":
          prompt = `Gere uma avaliação positiva em portugues sobre a empresa. A avaliação deve incidir sobre a qualidade do produto e do serviço, mencionando a utilização real dos produtos ou serviços oferecidos (produtos químicos de manutenção, sabões, fluidos de corte, massas lubrificantes, etc.), escrita como se fosse um cliente satisfeito a partilhar a sua experiência pessoal. Evite frases ou instruções genéricas para preencher, e a avaliação deve ter menos de 25 palavras. A avaliação deve assemelhar-se a uma avaliação real de um cliente satisfeito e não deve incluir nomes de empresas ou produtos. O nome da empresa ou do produto não deve ser referenciado, apenas a qualidade do produto e do serviço. Evite utilizar "Desde que comecei a utilizar os vossos produtos, a IA tornou-se demasiado generativa" e, por favor, não precisa de ser "Incrível" ou "Incrível", apenas uma avaliação simples. Por último, mas o mais importante, use ${extra} para o incluir na avaliação se não for igual a - CUIDADO, NÃO COLOQUE A MESMA COISA, mas respeite o nome, invente algo usando essa variável, por exemplo, se mencionar um vendedor, inclua-o na avaliação. `;
          break;
        default:
          prompt = `Genera una reseña positiva en español sobre la empresa. La reseña debe enfocarse en la calidad del producto y el servicio, mencionando el uso real de los productos o servicios ofrecidos (Son productos quimicos de mantenimiento, jabones, taladrinas, grasas etc), escrita como si fuera un cliente satisfecho que cuenta su experiencia personal. Evita frases genéricas o indicaciones para completar, y que la reseña tenga menos de 25 palabras la reseña debe parecerse a una reseña real de un cliente satisfecho que no tenga que intercalar ningun nombre de empresa o producto no se debe hacer referencia al nombre de la empresa o el nombre del producto solo a la calidad del producto y el servicio. Evita usar "Desde que uso sus productos queda muy generative AI" y por favor no tiene que ser "Sorprendente" o "Increible" solo una review sencilla por ultimo y mas importente analiza ${extra} para incluirlo en la reseña si no es igual a - `;
      }
      // Model initialization
      const modelId = "gemini-2.0-flash";
      const response = await genAI.models.generateContent({
        model: 'gemini-2.0-flash-001',
        contents: prompt,
      });
      console.log("RESPONSE: ", response.text);
      try {
        res.status(200).json({
          message: 'Review generated successfully',
          review: response.text,
        })
      } catch (error) {
        console.log("No se ha podido mandar el mensaje al bot", error.message);
      }


      // comentado para no gastar los creditos del proxy rotativo innecesariamente.
      // setUpScraper(
      //   'https://accounts.google.com/signin/v2/identifier',
      //   false,
      //   urlGoogleMaps,
      // ); // Este metodo, se logea y hará la tarea de colocar el review

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
