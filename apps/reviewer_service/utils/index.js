const puppeteer = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');

puppeteer.use(pluginStealth());

const headless = !process.argv.includes('-h');

const setUpScraper = (url, isHeadless, urlGoogleMaps) => {
  // const proxyURL = 'gw.dataimpulse.com:823';
  // const username = '74ff31ec3adc305985f9';
  // const password = '974d90e3632c87dd';

  // puppeteer
  //   .launch({
  //     headless: isHeadless,
  //     args: [`--proxy-server=${proxyURL}`],
  //   })
  //   .then(async (browser) => {

  puppeteer
    .launch({
      headless: isHeadless || false,
    })
    .then(async (browser) => {
      try {
        console.log('Opening browser ...');
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
        await page.mouse.move(100, 100);
        await page.mouse.down();
        await page.mouse.move(200, 100);
        await page.mouse.up();
        // Autenticación proxy si es necesario
        // await page.authenticate({
        //   username,
        //   password,
        // });
        const pages = await browser.pages();
        pages[0].close();
        await page.goto(url, {
          waitUntil: 'networkidle2',
        });
        if (headless) {
          // Only needed if sign in requires you to click 'sign in with google' button.
          // await page.waitForSelector('button[data-test="google-button-login"]');
          // await page.waitFor(1000);
          // await page.click('button[data-test="google-button-login"]');

          // Wait for email input.
          await page.waitForSelector('#identifierId');
          let badInput = true;

          // Keep trying email until user inputs email correctly.
          // This will error due to captcha if too many incorrect inputs.
          while (badInput) {
            await page.type('#identifierId', 'tresdedosmargarita41@gmail.com');
            await page.waitForTimeout(5000);
            await page.keyboard.press('Enter');
            await page.waitForTimeout(3000);
            badInput = await page.evaluate(
              () =>
                document.querySelector('#identifierId[aria-invalid="true"]') !==
                null,
            );
            if (badInput) {
              console.log('Incorrect email or phone. Please try again.');
              await page.click('#identifierId', { clickCount: 3 });
            }
          }
          // Wait for password input
          await page.waitForSelector('input[type="password"]', {
            visible: true,
          });
          await page.type('input[type="password"]', 'M44r1144n44!!!');
          await page.keyboard.press('Enter');

          // Manejo de CAPTCHA si aparece
          try {
            const solver = new Captcha.Solver();
          } catch (error) {}

          await page.goto(urlGoogleMaps, { waitUntil: 'networkidle2' });
          await page.waitForXPath("//span[contains(text(),'Reseñas')]", {
            visible: true,
          });
          const [span] = await page.$x("//span[contains(text(),'Reseñas')]");
          await span.click();
          console.log('Click en span Reseñas');

          await page.waitForXPath("//span[contains(text(),'Añadir reseña')]", {
            visible: true,
          });
          const [span2] = await page.$x(
            "//span[contains(text(),'Añadir reseña')]",
          );
          await span2.click();
          console.log('Click en span Añadir reseña');

          const iframe_found = False;
          const possible_iframes = [
            '/html/body/div[18]/iframe',
            "//iframe[contains(@src, 'reviews')]",
            "//iframe[contains(@src, 'maps')]",
            'iframe',
          ];

          // Esperar a que aparezca el textarea
          try {
            const textoResena = 'Esta es una reseña automatizada de prueba.';
            await page.waitForSelector(
              'textarea[aria-label="Comparte detalles de tu experiencia en este lugar"]',
              { visible: true, timeout: 10000 },
            );

            const textarea = await page.$(
              'textarea[aria-label="Comparte detalles de tu experiencia en este lugar"]',
            );
            await textarea.focus();
            await page.type(
              'textarea[aria-label="Comparte detalles de tu experiencia en este lugar"]',
              textoResena,
              { delay: 50 },
            );

            // Disparar manualmente eventos input y change
            await page.evaluate(() => {
              const el = document.querySelector(
                'textarea[aria-label="Comparte detalles de tu experiencia en este lugar"]',
              );
              if (el) {
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
              }
            });

            const value = await page.$eval(
              'textarea[aria-label="Comparte detalles de tu experiencia en este lugar"]',
              (el) => el.value,
            );
            console.log('Valor en textarea:', value);
            if (value !== textoResena) {
              console.error(
                '❌ El texto no se escribió correctamente en el textarea',
              );
              await page.screenshot({ path: 'error_textarea_no_escrito.png' });
              return;
            } else {
              console.log('✅ Texto escrito correctamente en el textarea');
            }
          } catch (err) {
            console.error('No se pudo escribir en el textarea: ', err.message);
            await page.screenshot({ path: 'error_type_textarea.png' });
            return;
          }

          // Esperar a que se rendericen las estrellas
          try {
            await page.waitForSelector('span[aria-label$="estrellas"]', {
              visible: true,
              timeout: 10000,
            });
          } catch (err) {
            console.error('No se encontraron las estrellas: ', err.message);
            await page.screenshot({ path: 'error_stars.png' });
            return;
          }

          // Obtener todas las estrellas
          const stars = await page.$$('span[aria-label$="estrellas"]');
          if (!stars.length) {
            console.error('❌ No encontré estrellas en el modal');
            await page.screenshot({ path: 'error_no_stars.png' });
            return;
          }

          // Random entre 4 y 5 estrellas
          const rating = Math.random() < 0.5 ? 4 : 5;
          await stars[rating - 1].click();
          console.log(`✅ Seleccionadas ${rating} estrellas`);

          await page.waitForTimeout(120000);

          // For headless mode, 2FA needs to be handled here.
          // Login via gmail app works autmatically.
        }
      } catch (error) {
        console.error('Error general en el scraper:', error.message);
      } finally {
        // Si el navegador sigue abierto, cerrarlo
        // Navegador NO se cierra automáticamente para depuración
        // try {
        //   await browser.close();
        // } catch (e) {}
      }
    });
};

module.exports = {
  setUpScraper,
};
