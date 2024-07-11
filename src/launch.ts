import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import os from 'os'

puppeteer.use(StealthPlugin());

export async function launchBrowser(headless: boolean) {
    const browser = await puppeteer.launch({
        headless: headless,
        args: ['--no-sandbox', '--disable-setuid-sandbox'], // добавлены флаги
        executablePath: (os.platform() === 'darwin') ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : ''

       // executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' // Укажите путь к вашему Chrome
    });
    console.log(puppeteer.executablePath())
    return browser;
}

