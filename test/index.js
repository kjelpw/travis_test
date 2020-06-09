'use strict';

const request = require('supertest');
const webdriver = require('selenium-webdriver');
const assert = require('assert');
var chrome = require('selenium-webdriver/chrome');
var path = require('chromedriver').path;
const frontend = 'http://localhost:9007';  // change to local environment or travis environment url

// handles ssl cert if it's available on test domains.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

// start tests "mocha index.js"

describe('Tests if tests are working', function(){
    it('1==1', function(){
      assert.equal(1, 1);
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
let browser;

var service = new chrome.ServiceBuilder(path).build();
chrome.setDefaultService(service);

describe('Special Collections (Selenium) Tests', function() {

    // executes before each test
    beforeEach(function(done) {
        var opts = new chrome.Options()
        .addArguments('--no-sandbox').addArguments('--disable-dev-shm-usage').addArguments('--headless');
        browser = new webdriver.Builder().
        withCapabilities(webdriver.Capabilities.chrome()).setChromeOptions(opts).build();
        // withCapabilities(webdriver.Capabilities.safari()).
        // withCapabilities(webdriver.Capabilities.firefox()).
        browser.get(frontend);
        done();
    });

    // executes after each test
    /*
    afterEach(function(done) {

        setTimeout(function() {
            console.log('quit.');
            browser.quit();
        }, 15000); // adjust

    });
    */

    it('UI tests', function(done) {
        try {
          console.log('search hockey');
          browser.findElement(webdriver.By.name('q[]')).sendKeys('hockey');
          browser.findElement(webdriver.By.tagName('button')).click().then(function() {

              // TODO: add assertions for promises
              console.log('click accordion');
              browser.findElement(webdriver.By.className('accordion')).click().then(function() {

                  // TODO: add assertions
                  console.log('find facet');
                  let facet = browser.findElement(webdriver.By.className('facet-name'));
                  facet.findElement(webdriver.By.tagName('a')).click();

                  // TODO: add assertions
                  // assert.equal('', '');

              });
          });
          setTimeout(function() {
              console.log('quit.');
              browser.quit();
          }, 15000); // adjust
          done();
        } catch(err) {
          console.log('ERROR HERE');
          browser.quit();
          done(new Error());
        }
    });
});
