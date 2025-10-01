const puppeteer = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');
const dotenv = require('dotenv');
dotenv.config();
const PROXY_URL = process.env.PROXY_URL;
const PROXY_USERNAME = process.env.PROXY_USERNAME;
const PROXY_PASSWORD = process.env.PROXY_PASSWORD;
puppeteer.use(pluginStealth());

const headless = !process.argv.includes('-h');

const setUpScraper = (url, isHeadless, urlGoogleMaps) => {
  const proxyURL = PROXY_URL;
  const username = PROXY_USERNAME;
  const password = PROXY_PASSWORD;

  puppeteer
    .launch({
      headless: isHeadless,
      args: [`--proxy-server=${proxyURL}`],
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
        await page.authenticate({
          username,
          password,
        });
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


          await page.goto(urlGoogleMaps, { waitUntil: 'networkidle2' });

          await page.waitForTimeout(10000);

          await page.mouse.move(200, 200);
          await page.waitForTimeout(500 + Math.random() * 500);
          await page.mouse.move(400, 250);
          await page.waitForTimeout(500 + Math.random() * 500);


          await page.waitForXPath(`//div[contains(text(), "Reseñas") or contains(text(), "Reviews")]`, {
            visible: true
          });
          const [btnDiv] = await page.$x(`//div[contains(text(), "Reseñas") or contains(text(), "Reviews")]`);


          if (btnDiv) {
            const btn = await btnDiv.evaluateHandle(el => el.closest("button"));
            await btn.click();
          }
          await page.waitForTimeout(5000);
          await page.mouse.move(100, 100);
          await page.waitForTimeout(1000 + Math.random() * 500);
          await page.mouse.move(200, 250);
          await page.waitForTimeout(500 + Math.random() * 500);


          await page.waitForXPath(`//span[contains(text(), "Escribir una reseña") or contains(text(), "Write a review")]`, {
            visible: true
          });
          const [span] = await page.$x(`//span[contains(text(), "Escribir una reseña") or contains(text(), "Write a review")]`);


          if (span) {
            const btn = await span.evaluateHandle(el => el.closest("button"));
            await btn.click();
          }

          await page.waitForTimeout(2000);

          const iframeElementHandle = await page.waitForSelector('iframe[name="goog-reviews-write-widget"')

          console.log('Iframe handle:', iframeElementHandle);
          const frame = await iframeElementHandle.contentFrame(); // Espera a que se resuelva el Frame
          await page.waitForTimeout(10000); // Espera adicional para asegurarse de que el contenido del iframe esté completamente cargado
          if (frame) {
            const iframeContent = await frame.evaluate(() => document.body.innerHTML);
            const textareaHandle = await frame.waitForSelector('#c2');
            if (textareaHandle) {
              await textareaHandle.click();
              await textareaHandle.type('Es uno de los mejores talleres de barcelona', { delay: 200 });

            }
            const rating = Math.random() < 0.5 ? 4 : 5;

            let starClicked = false;

            switch (rating) {
              case 4: {
                const fourthStar = await frame.waitForSelector('div[aria-label="Cuatro estrellas"]', { timeout: 2000 }).catch(() => null);
                if (fourthStar) {
                  await fourthStar.click();
                  console.log('✅ Seleccionadas 4 estrellas');
                  starClicked = true;
                }
                break;
              }
              case 5: {
                const fifthStar = await frame.waitForSelector('div[aria-label="Cinco estrellas"]', { timeout: 2000 }).catch(() => null);
                if (fifthStar) {
                  await fifthStar.click();
                  console.log('✅ Seleccionadas 5 estrellas');
                  starClicked = true;
                }
                break;
              }

            }
            if (!starClicked) {
              console.error('❌ No encontré estrellas en el modal del iframe');
              await page.screenshot({ path: 'error_no_stars_iframe.png' });
            }

          }
          await page.waitForTimeout(4000);
          const [submitButton] = await frame.$x(`//button[contains(., 'Publicar') or contains(., 'Post')]`);
          if (submitButton) {
            await submitButton.click();
            console.log('✅ Reseña publicada');
          } else {
            console.error('❌ No encontré el botón de publicar en el iframe');
            await page.screenshot({ path: 'error_no_submit_button_iframe.png' });
          }


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
