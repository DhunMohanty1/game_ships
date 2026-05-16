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
  
  // Expose an evaluation
  const report = await page.evaluate(() => {
     let logs = [];
     const getPath = (obj, path) => path.split('.').reduce((o, p) => o ? o[p] : null, obj);
     
     // Find the game loop. We know it's attached to UIManager as `uiManager.gameLoop`? No, wait.
     // In index.html: `const gameLoop = new GameLoop(container); window.gameLoop = gameLoop;`
     // Let's assume window.gameLoop exists. I didn't add it in index.html, did I?
     // Let's just grab the THREE scene.
     
     logs.push("Testing positions...");
     return logs;
  });
  console.log(report);
  await browser.close();
})();
