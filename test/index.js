'use strict';

const request = require('supertest');
const webdriver = require('selenium-webdriver');
const assert = require('assert');
var chrome = require('selenium-webdriver/chrome');
var path = require('chromedriver').path;
const frontend = 'https://specialcollections.du.edu/';  // change to local environment or travis environment url

// handles ssl cert if it's available on test domains.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

// start tests "mocha index.js"

describe('Tests if tests are working', function(){
    it('1==1', function(){
      assert.equal(1, 1);
    });
});

describe('Promise tests', function () {
  it('Promise should pass', function () {
    let promise = new Promise(function(resolve, reject) {
      setTimeout(() => resolve('done'), 1000);
    });
    return promise;
  });
});

// Integration tests
describe('GET special collections home page test', function() { // Test description
    it('responds with HTML 200 response', function(done) {
        request(frontend)  // <-- pass in domain
            .get('/') // home page
            .set('Accept', 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9')
            .expect('Content-Type', 'text/html; charset=utf-8')
            .expect(200, done);
    });
});

describe('GET special collections search test', function() {
    it('responds with HTML 200 response', function(done) {
        request(frontend)  // <-- pass in domain
            .get('/search') // search.  Can be expanded to perform different types of search by appending query string ** see test below
            .set('Accept', 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9')
            .expect('Content-Type', 'text/html; charset=utf-8')
            .expect(200, done);
    });
});

describe('GET special collections search with keyword term test', function() {
    it('responds with HTML 200 response', function(done) {
        request(frontend)  // <-- pass in domain
            .get('/search?field%5B%5D=all&q%5B%5D=hockey&type%5B%5D=contains&bool%5B%5D=or') // search for hockey records
            .set('Accept', 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9')
            .expect('Content-Type', 'text/html; charset=utf-8')
            .expect(200, done);
    });
});

//this still returns 200 if the object isn't found, should change?
describe('GET special collections object details', function() {
    it('responds with HTML 200 response', function(done) {
        request(frontend)  // <-- pass in domain
            .get('/object/81c733ec-b597-48d1-9488-90f2a67627') // uuid can be placed in variable above
            .set('Accept', 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9')
            .expect('Content-Type', 'text/html; charset=utf-8')
            .expect(200, done);
    });
});


// Selenium tests
// https://chromedriver.storage.googleapis.com/index.html?path=83.0.4103.39/
// https://www.toolsqa.com/selenium-webdriver/find-element-selenium/
// https://www.toolsqa.com/selenium-webdriver/webelement-commands/
// ** you can also use a driver for firefox and safari
var browser;

var service = new chrome.ServiceBuilder(path).build();
chrome.setDefaultService(service);

describe('Special Collections (Selenium) Tests', function() {

    // executes before everything
    before(function() {
        var opts = new chrome.Options()
        .addArguments('--no-sandbox').addArguments('--disable-dev-shm-usage').addArguments('--headless');
        browser = new webdriver.Builder().
        withCapabilities(webdriver.Capabilities.chrome()).setChromeOptions(opts).build();
        // withCapabilities(webdriver.Capabilities.safari()).
        // withCapabilities(webdriver.Capabilities.firefox()).
    });

    //closes the browser when done
    after(function() {
      console.log('quitting');
      return browser.quit();
    });

    describe('UI Tests', function () {
      describe('Search object tests', function() {
        before(function() {
          return browser.get(frontend);
        });

        it('Searchbox placeholder text', async function() {
          return browser.findElement(webdriver.By.name('q[]')).getAttribute('placeholder').then(function(text) {
            assert(text, 'Search Keywords(s)');
          });
        });

        it('Search hockey', async function() {
          return browser.findElement(webdriver.By.name('q[]')).sendKeys('hockey');
        });

        it('Should get hockey', async function() {
          return browser.getTitle().then(function(title) {
            //test if the search for hockey worked
            assert(title, 'Digital Collections @ DU');
          });
        });
      });

      describe('facet tests', function() {
        before(function() {
          return browser.get(frontend);
        });

        it('Type Facet', async function() {
          return browser.findElement(webdriver.By.id('type-facet'));
        });
      });

      //further tests
      // describe('Accordion test', function() {
      //   it('Click search button test', function(done) {
      //       return browser.findElement(webdriver.By.tagName('button')).click().then(function() {
      //         // TODO: add assertions for promises
      //         console.log('click accordion');
      //         browser.findElement(webdriver.By.className('accordion')).click().then(function() {
      //
      //             // TODO: add assertions
      //             console.log('find facet');
      //             let facet = browser.findElement(webdriver.By.className('facet-name'));
      //             facet.findElement(webdriver.By.tagName('a')).click().then(function(){
      //               done();
      //             });
      //
      //             // TODO: add assertions
      //             // assert.equal('', '');
      //
      //         });
      //       });
      //     });
      // });
    });
});
