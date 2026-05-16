import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await page.goto('http://localhost:3000');
  await page.waitForSelector('#btn-singleplayer');
  await page.click('#btn-singleplayer');
  await new Promise(r => setTimeout(r, 500));
  
  await page.waitForSelector('.ship-btn[data-ship="sloop"]');
  await page.click('.ship-btn[data-ship="sloop"]');
  
  await new Promise(r => setTimeout(r, 1000));
  
  await browser.close();
})();
