'use strict';

const request = require('supertest');
const webdriver = require('selenium-webdriver');
const assert = require('assert');
var expect = require('chai').expect;
var chrome = require('selenium-webdriver/chrome');
var path = require('chromedriver').path;
const frontend = 'http://localhost:9007';  // change to local environment or travis environment url

// handles ssl cert if it's available on test domains.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

// start tests "mocha index.js"

describe('Tests if assertion tests are working', function(){
    it('1==1', function(){
      assert.equal(1, 1);
    });
});

describe('Tests if promise tests are working', function () {
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
      before(function() {
        return browser.get(frontend);
      });

      it('Tab title test', function() {
        return browser.getTitle().then(function(title) {
          expect(title).to.equal('Digital Collections @ DU');
        });
      });





      //for searching for objects using the search box
      describe('Search object tests', function() {
        before(function() {
          return browser.get(frontend);
        });

        it('Searchbox placeholder text', function() {
          return browser.findElement(webdriver.By.name('q[]')).getAttribute('placeholder').then(function(text) {
            //assert(text, 'Search Keywords(s)');
            expect(text).to.equal('Search Keyword(s)');
          });
        });

        it('Search hockey', function() {
          return browser.findElement(webdriver.By.name('q[]')).sendKeys('hockey');
        });

        //TODO
        it('Should get hockey', function() {
          return browser.getTitle().then(function(title) {
            //test if the search for hockey worked
            expect(title).to.equal('Digital Collections @ DU');
          });
        });
      });







      //for the accorions/facets on the main page
      describe('Facet tests (frontpage)', function() {
        //navigate to the frontapge
        before(function() {
          return browser.get(frontend);
        });

        //check the type facet title
        it('Type Facet title', function() {
          return browser.findElement(webdriver.By.id('type-facet'))
          .getAttribute('innerHTML').then(function(text) {
            expect(text).to.include('<h4>Type</h4>');
          });
        });

        it('Type Facet not hidden', function() {
          return browser.findElement(webdriver.By.xpath('/html/body/div/main/div/div[2]/div[1]/div/div[1]'))
          .isDisplayed()
          .then(function(visible) {
            expect(visible).to.equal(true);
          });
        });

        it('Type Facet caret before click', function() {
          return browser.findElement(webdriver.By.xpath('/html/body/div/main/div/div[2]/div[1]/div/button[1]/i'))
          .getAttribute('class').then(function(text) {
            expect(text).to.include('fa-caret-down');
          });
        });

        //inserted 3 still test into elasticsearch images, should show 3 in the facet
        it('Type Facet contents: still image count', function() {
          return browser.findElement(webdriver.By.xpath('/html/body/div/main/div/div[2]/div[1]/div/div[1]/ul/li[1]/div/div[3]/div'))
          .getAttribute('innerHTML').then(function(text) {
            expect(text).to.include('3');
          });
        });

        it('Type Facet contents: text count', function() {
          return browser.findElement(webdriver.By.xpath('/html/body/div/main/div/div[2]/div[1]/div/div[1]/ul/li[2]/div/div[3]/div'))
          .getAttribute('innerHTML').then(function(text) {
            expect(text).to.include('0');
          });
        });

        it('Type Facet contents: moving image count', function() {
          return browser.findElement(webdriver.By.xpath('/html/body/div/main/div/div[2]/div[1]/div/div[1]/ul/li[3]/div/div[3]/div'))
          .getAttribute('innerHTML').then(function(text) {
            expect(text).to.include('0');
          });
        });

        it('Type Facet contents: sound recording count', function() {
          return browser.findElement(webdriver.By.xpath('/html/body/div/main/div/div[2]/div[1]/div/div[1]/ul/li[4]/div/div[3]/div'))
          .getAttribute('innerHTML').then(function(text) {
            expect(text).to.include('0');
          });
        });

        //click the type facet
        it('Type Facet 1st click', function() {
          return browser.findElement(webdriver.By.id('type-facet'))
          .click();
        });

        //currently (correctly )fails due to bug, different caret?
        it('Type Facet hidden', function() {
          return browser.findElement(webdriver.By.xpath('/html/body/div/main/div/div[2]/div[1]/div/div[1]'))
          .isDisplayed()
          .then(function(visible) {
            expect(visible).to.equal(false);
          });
        });

        it('Type Facet caret after click', function() {
          return browser.findElement(webdriver.By.xpath('/html/body/div/main/div/div[2]/div[1]/div/button[1]/i'))
          .getAttribute('class').then(function(text) {
            expect(text).to.include('a-caret-right');
          });
        });

        //click the type facet
        it('Type Facet 2nd click', function() {
          return browser.findElement(webdriver.By.id('type-facet'))
          .click();
        });

        it('Type Facet not hidden after 2nd click', function() {
          return browser.findElement(webdriver.By.xpath('/html/body/div/main/div/div[2]/div[1]/div/div[1]'))
          .isDisplayed()
          .then(function(visible) {
            expect(visible).to.equal(true);
          });
        });

        it('Type Facet caret after 2nd click', function() {
          return browser.findElement(webdriver.By.xpath('/html/body/div/main/div/div[2]/div[1]/div/button[1]/i'))
          .getAttribute('class').then(function(text) {
            expect(text).to.include('fa-caret-down');
          });
        });
        //TODO add tests to see if the window is populated








        //check the collection facet title
        it('Collections Accordion title', function() {
          return browser.findElement(webdriver.By.xpath('/html/body/div/main/div/div[2]/div[1]/div/button[2]'))
          .getAttribute('innerHTML')
          .then(function(text) {
            expect(text).to.include('<h4>Collections</h4>');
          });
        });

        it('Collections Accordion hidden', function() {
          return browser.findElement(webdriver.By.id('collections-window'))
          .isDisplayed()
          .then(function(visible) {
            expect(visible).to.equal(false);
          });
        });

        it('Collections Facet caret before click', function() {
          return browser.findElement(webdriver.By.xpath('/html/body/div/main/div/div[2]/div[1]/div/button[2]/i'))
          .getAttribute('class').then(function(text) {
            expect(text).to.include('fa-caret-right');
          });
        });

        //click the collection accordion
        it('Collections Accordion 1st click', function() {
          return browser.findElement(webdriver.By.xpath('/html/body/div/main/div/div[2]/div[1]/div/button[2]'))
          .click();
        });

        it('Collections Accordion not hidden', function() {
          return browser.findElement(webdriver.By.id('collections-window'))
          .isDisplayed()
          .then(function(visible) {
            expect(visible).to.equal(true);
          });
        });

        it('Collections Facet caret after 1st click', function() {
          return browser.findElement(webdriver.By.xpath('/html/body/div/main/div/div[2]/div[1]/div/button[2]/i'))
          .getAttribute('class').then(function(text) {
            expect(text).to.include('fa-caret-down');
          });
        });

        it('Collections Accordion 2nd click', function() {
          return browser.findElement(webdriver.By.xpath('/html/body/div/main/div/div[2]/div[1]/div/button[2]'))
          .click();
        });

        it('Collections Accordion hidden', function() {
          return browser.findElement(webdriver.By.id('collections-window'))
          .isDisplayed()
          .then(function(visible) {
            expect(visible).to.equal(false);
          });
        });

        it('Collections Facet caret after 2nd click', function() {
          return browser.findElement(webdriver.By.xpath('/html/body/div/main/div/div[2]/div[1]/div/button[2]/i'))
          .getAttribute('class').then(function(text) {
            expect(text).to.include('fa-caret-right');
          });
        });
        //TODO add tests to see if the window is populated







        //check the creator accordion title
        it('Creator Accordion title', function() {
          return browser.findElement(webdriver.By.xpath('/html/body/div/main/div/div[2]/div[1]/div/button[3]'))
          .getAttribute('innerHTML')
          .then(function(text) {
            expect(text).to.include('Creator');
          });
        });

        it('Creator Accordion hidden', function() {
          return browser.findElement(webdriver.By.id('Creator-window'))
          .isDisplayed()
          .then(function(visible) {
            expect(visible).to.equal(false);
          });
        });

        it('Creator Facet caret before click', function() {
          return browser.findElement(webdriver.By.xpath('/html/body/div/main/div/div[2]/div[1]/div/button[3]/i'))
          .getAttribute('class').then(function(text) {
            expect(text).to.include('fa-caret-right');
          });
        });

        //click the creator accordion
        it('Creator Accordion 1st click', function() {
          return browser.findElement(webdriver.By.xpath('/html/body/div/main/div/div[2]/div[1]/div/button[3]'))
          .click();
        });

        it('Creator Accordion not hidden', function() {
          return browser.findElement(webdriver.By.id('Creator-window'))
          .isDisplayed()
          .then(function(visible) {
            expect(visible).to.equal(true);
          });
        });

        it('Creator Facet caret after click', function() {
          return browser.findElement(webdriver.By.xpath('/html/body/div/main/div/div[2]/div[1]/div/button[3]/i'))
          .getAttribute('class').then(function(text) {
            expect(text).to.include('fa-caret-down');
          });
        });

        it('Creator Accordion 2nd click', function() {
          return browser.findElement(webdriver.By.xpath('/html/body/div/main/div/div[2]/div[1]/div/button[3]'))
          .click();
        });

        it('Creator Accordion hidden', function() {
          return browser.findElement(webdriver.By.id('Creator-window'))
          .isDisplayed()
          .then(function(visible) {
            expect(visible).to.equal(false);
          });
        });

        it('Creator Facet caret before click', function() {
          return browser.findElement(webdriver.By.xpath('/html/body/div/main/div/div[2]/div[1]/div/button[3]/i'))
          .getAttribute('class').then(function(text) {
            expect(text).to.include('fa-caret-right');
          });
        });
        //TODO add tests to see if the window is populated
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
