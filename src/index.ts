import { launchBrowser } from './launch';
import puppeteer, { Browser, ElementHandle, Page } from 'puppeteer';
import config from './config';
import axios from 'axios';
import os from 'os';

async function scren(page: Page, caption: string = '') {
    const imageBuffer = await page.screenshot({ type: 'png', fullPage: false });
    const formData = new FormData();
    const blob = new Blob([imageBuffer], { type: 'image/png' });
    formData.append('photo', blob, 'example.png');
    const telegramApiUrl = `https://api.telegram.org/bot${config.OUR_BOT_TOKEN}/sendPhoto`;
    const url = `${telegramApiUrl}?chat_id=${config.chatId}&caption=${caption}`;

    try {
        const response = await axios.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        // console.log('Скриншот успешно отправлен в Telegram:', response.data);
    } catch (error) {
        console.error('Ошибка при отправке скриншота в Telegram:', error);
    }
}

async function typeTextByXPath(page: Page, xpath: string, text: string) {
    const elementHandle = await page.evaluateHandle((xpath) => {
        const xpathResult = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        return xpathResult.singleNodeValue;
    }, xpath);

    if (elementHandle) {
        await (elementHandle as ElementHandle).type(text);
        console.log(`Текст '${text}' введен в элемент с XPath '${xpath}'`);
    } else {
        console.log(`Элемент с XPath '${xpath}' не найден`);
    }
}

async function clickElementByXPath(page: Page, xpath: string) {
    const elementHandle = await page.evaluateHandle((xpath) => {
        const xpathResult = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        return xpathResult.singleNodeValue;
    }, xpath);

    if (elementHandle) {
        await (elementHandle as ElementHandle).click();
        console.log(`Клик выполнен на элементе с XPath '${xpath}'`);
    } else {
        console.log(`Элемент с XPath '${xpath}' не найден`);
    }
}

async function scrollToBottom(page: Page) {
    await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
    });
}

async function run(page: Page) {
    let nextPageExists = true;
    await page.goto('https://google.com');
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
        await (await page.waitForSelector('::-p-xpath(//div[@class="QS5gu sy4vM"])', { timeout: 3000 })).click();
    } catch (error) {
        //console.log(error);
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
        await (await page.waitForSelector('::-p-xpath(//textarea[@name="q"])', { timeout: 3000 })).type('Ваш текст', { delay: 50 });
    } catch (error) {
        //console.log(error);
    }

    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 2000));

    await scrollToBottom(page);
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.waitForSelector('#rso', { timeout: 3000 }).then(async() => {

        const links = await page.evaluate(() => {
            const results = document.evaluate(
                '//*[@id="rso"]//a[@href]',
                document,
                null,
                XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
                null
            );

            const linksArray = [];
            for (let i = 0; i < results.snapshotLength; i++) {
                const link = results.snapshotItem(i) as HTMLElement;
                linksArray.push(link.getAttribute('href'));
            }
            return linksArray;
        });

        links.forEach((link, index) => console.log(`${index + 1}. ${link}`));
    }).catch(()=>{})
    await scren(page);
    await new Promise(resolve => setTimeout(resolve, 5000));
    await scren(page, 'Это скриншот');
}

(async () => {
    const browser: Browser = await launchBrowser((os.platform() === 'darwin') ? false : true);
    const page: Page = await browser.newPage();

    await run(page);

    await browser.close();
})();
