#!/usr/local/bin/node

'use strict';

/**
 * Chronovid19
 *
 * Teste si son Chronodrive préféré a un slot de libre
 *
 * la classe hasNoSlots est appliqué au body si rien n'est libre, on estime que si c'est libre cette classe n'apparait pas ...
 */

const puppeteer = require('puppeteer');

const urlStore = 'https://www.chronodrive.com/prehome.searchshop.searchshoplayercontent.goshop.actionlink_0/1007/Prehome$007c1007_Ballainvilliers$007csearch$0020results';

const util = require('util');
const exec = util.promisify(require('child_process').exec);

(async() => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(urlStore, {waitUntil: 'domcontentloaded'});

  const bodyClassList = await page.$eval('body', el => el.classList);

  let hasSlots = true;
  for (let [key, value] of Object.entries(bodyClassList)) {
    if (value == 'hasNoSlots') {
      hasSlots = false;
    }
  }

  if (hasSlots) {
    console.log(new Date(), ': YOUPI DES SLOTS :)');
    // très MacOS...
    await exec('say YOUPI CHRONODRIVE A UN SLOT DE LIBRE');
  } else {
    console.log(new Date(), ': RIEN de LIBRE :(');
  }

  await browser.close();

})();

