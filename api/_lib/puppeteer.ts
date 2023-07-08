import { launch, Page } from "puppeteer-core";
import chrome from "chrome-aws-lambda";
let _page: Page | null;

async function getPage() {
  if (_page) return _page;
  const options = {
    args: chrome.args,
    executablePath: await chrome.executablePath,
    headless: chrome.headless,
  };
  const browser = await launch(options);
  _page = await browser.newPage();
  return _page;
}

export async function getScreenshot(url, w, h, delay) {
  const page = await getPage();
//   await page.setViewport({ width: Number(width) || 1920, height: Number(height) || 1080 });
  await page.goto(url, {waitUntil: 'load'}); // Wait until networkidle2 could work better.

  // Set the viewport before scrolling
  await page.setViewport({ width: 1366, height: 768});

  // Get the height of the page after navigating to it.
  // This strategy to calculate height doesn't work always though. 
  const bodyHandle = await page.$('body');
  const { height } = await bodyHandle.boundingBox();
  await bodyHandle.dispose();

  // Scroll viewport by viewport, allow the content to load
  const calculatedVh = page.viewport().height;
  let vhIncrease = 0;
  while (vhIncrease + calculatedVh < height) {
    // Here we pass the calculated viewport height to the context
    // of the page and we scroll by that amount
    await page.evaluate(_calculatedVh => {
      window.scrollBy(0, _calculatedVh);
    }, calculatedVh);
    await waitFor(300);
    vhIncrease = vhIncrease + calculatedVh;
  }

  // Setting the viewport to the full height might reveal extra elements
  await page.setViewport({ width: 1366, height: calculatedVh});

  // Wait for a little bit more
  await waitFor(1000);

  // Scroll back to the top of the page by using evaluate again.
  await page.evaluate(_ => {
    window.scrollTo(0, 0);
  });

  return await page.screenshot({type: 'png'});
}

function waitFor (ms) {
    return new Promise(resolve => setTimeout(() => resolve(), ms));
  }
