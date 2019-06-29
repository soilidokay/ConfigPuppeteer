const puppeteer = require('puppeteer');
const VietNameWork = require('./src/ModuleWebPages/VietNameWork');
// vietnamworks.com, careerlink.vn, careerbuilder,  mywork, vieclam24h, timviecnhanh.com , itviec, topcv

(async () => {
    const browser = await puppeteer.launch();

    let test = new VietNameWork(browser)

    await test.run()
    await browser.close();
})();

