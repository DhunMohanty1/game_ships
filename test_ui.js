import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  await page.goto('http://localhost:3000');
  await page.waitForSelector('#btn-singleplayer');
  await page.click('#btn-singleplayer');
  await new Promise(r => setTimeout(r, 1000));
  
  await page.waitForSelector('.ship-btn[data-ship="sloop"]');
  await page.click('.ship-btn[data-ship="sloop"]');
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Inject script to check NaN
  const report = await page.evaluate(() => {
     if (!window.game) return 'no window.game'; // wait, did I expose gameLoop to window?
     return {
        // we can try to find the gameLoop or just check the scene
        // actually, let's just dump window properties
        keys: Object.keys(window)
     };
  });
  console.log('EVAL:', report);

  await browser.close();
})();
