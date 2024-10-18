const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const credentialsFolder = path.join(__dirname, 'credentials');

async function readCredentials() {
    const files = fs.readdirSync(credentialsFolder);
    const profiles = [];

    for (const file of files) {
        const filePath = path.join(credentialsFolder, file);
        const profileData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        profiles.push(profileData);
    }

    return profiles;
}


async function createProfileAndLogin(profile) {

    const browser = await puppeteer.launch({
        headless: false,
        args: [
            `--user-data-dir=./chrome-profiles/${profile.email}`
        ]
    });

    const page = await browser.newPage();

    await page.goto('https://accounts.google.com/');

    await page.waitForSelector('input[type="email"]');
    await page.type('input[type="email"]', profile.email);
    await page.click('#identifierNext');

    await page.waitForSelector('input[type="password"]', { visible: true });
    await page.type('input[type="password"]', profile.password);
    await page.click('#passwordNext');

    if (await page.$('input[type="email"]')) {
        await page.type('input[type="email"]', profile.recoveryEmail);
        await page.click('#nextButton');
    }

    await page.waitForNavigation();

    await browser.close();
}

async function runBot() {
    const profiles = await readCredentials();

    for (const profile of profiles) {
        console.log(`Logging in for ${profile.email}...`);
        await createProfileAndLogin(profile);
    }
}

runBot().catch(console.error);
