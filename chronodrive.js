const prompts = require('prompts');

module.exports = class ChronoDrive {
    constructor(page, ui, status) {
        this.page = page;
        this.store = null;
        this.ui = ui;
        this.status = status;
    }

    async start() {
        if (this.store === null) {
            this.store = await this.askForStore();
            this.ui.setStoreName(this.store.value);
        }
        this.ui.start();
        this.reCheck();
    }

    async askForStore() {
        let zipCode = prompts({type: 'text', name: 'value', message: 'Trouver un magasin proche de :'});
        let pageLoader = this.page.goto('https://www.chronodrive.com', {waitUntil: 'domcontentloaded'});
        let result = await Promise.all([pageLoader, zipCode]).then((result) => result[1].value);

        this.ui.start();

        await this.page.evaluate((zipCode) => {
            document.querySelector('#searchField').value = zipCode;
            document.querySelector('#linksubmit').click();
        }, result);
        await this.page.waitForSelector('#resultZone > ul');
        let stores = await this.page.evaluate(() => {
            let stores = {};
            document.querySelectorAll('#resultZone > ul > li').forEach((el) => {
                let title = el.querySelector('.lib-drive strong').textContent;
                stores[ title ] = {
                    value: title,
                    url: el.querySelector('a.btn-green').href
                }
            });
            return stores;
        });
        this.ui.stop();
        let choice = await prompts({type: 'select', name: 'name', message: '', choices: Object.values(stores)});
        return stores[choice.name];
    }

    async reCheck()
    {
        try {
            this.status.setRequesting(true);
            await this.page.goto(this.store.url, {waitUntil: 'domcontentloaded'});
            this.status.setRequesting(false);
            await this.check();
        } catch(_) {
            this.status.add('error');
        }
        setTimeout(async() => { this.reCheck(); }, 30000)
    }

    async check()
    {
      if (/maintenance\.html$/.test(this.page.url())) {
        this.status.add('maintenance' + i < 3 ? '' : '+');
        return ;
      }
      let hasNoSlots = await this.page.$eval('body', (el) => el.classList.contains('hasNoSlots'));
      if (!hasNoSlots) {
        this.status.add('available');
      } else {
        this.status.add('unavailable');
      }
    }
}