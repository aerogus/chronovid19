#!/usr/local/bin/node

'use strict';

/**
 * Chronovid19
 *
 * Teste si son Chronodrive préféré a un slot de libre
 * la classe hasNoSlots est appliqué au body si rien n'est libre, on estime que si c'est libre cette classe n'apparait pas ...
 */

const puppeteer = require('puppeteer');
const status = new (require('./status'))();
const ChronoDrive = require('./chronodrive');

(async() => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  const ui = new (require('./ui'))(status, 150);

  let drive = new ChronoDrive(page, ui, status);
      drive.start();
})();
