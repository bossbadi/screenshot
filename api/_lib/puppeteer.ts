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

export async function getScreenshot(url, width, height) {
  const page = await getPage();
  await page.setViewport({ width: Number(width) || 1920, height: Number(height) || 1080 });
  await page.goto(url);
  return await page.screenshot();
}
