// ==UserScript==
// @name         Xero BankRec helper
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Automatically filters BankRec matches by transaction name. If common 'overseas' transactions are found, it will also uncheck the 'Show {currency} items only'
// @author       Nick Whiteside, Jade Montagu
// @homepage     https://github.com/jmontagu/xero-scripts
// @updateURL    https://github.com/JMontagu/Xero-Scripts/raw/master/xero-bankrec-helper.user.js
// @downloadURL  https://github.com/JMontagu/Xero-Scripts/raw/master/xero-bankrec-helper.user.js
// @supportURL   https://github.com/JMontagu/Xero-Scripts/issues
// @match        https://go.xero.com/Bank/BankRec.aspx*
// @grant        none
// ==/UserScript==

(function() {
  // ===UserSettings===
  var tryMatchEverything = true; // if true, will always try to match by transaction text. If false, only transactions matching overseasTransactionNames
  var overseasTransactionNames = [
    'Amazon',
    'Twilio',
    'ExpressVpn'
  ]; // if matches transaction text, will uncheck 'Show AUD items only'
  // ===/UserSettings===

  // Looks at each parent for matching class and returns it
  function findParentByClass(element, className) {
    return element.className.split(' ').includes(className) ? element : findParent(element.parentElement, className);
  }

  function waitFor(selector, maxWaitTime = 1000) {
    var maxWait = maxWaitTime / 100;

    return new Promise(function(resolve, reject) {
      (function wait() {
        var result = selector();

        if (maxWait <= 0) {
          return reject('Wait timeout');
        }
        if (!result.length) {
          maxWait--;
          setTimeout(wait, 100, selector, maxWait);
        } else {
          return resolve(result);
        }
      })();
    });
  }

  // sends off an 'Enter/Return' event as if the user had hit the key themselves
  function enterInput(inputElmement) {
    var enterKeyEvent = document.createEvent('Event');
    enterKeyEvent.initEvent('keypress');
    enterKeyEvent.which = (enterKeyEvent.keyCode = 13);
    inputElmement.dispatchEvent(enterKeyEvent);
  }

  // Finds 'line item' then waits for its bank-rec form to load
  function waitForBankRecFormToLoad() {
    var lineItemContainer = findParentByClass(this, 'line');
    waitFor(() => lineItemContainer.getElementsByClassName('bankrec-search-form'), 5000)
      .then(elem => toggleBankRec(elem[0], lineItemContainer))
      .catch(console.error);
  }

  //
  function toggleBankRec(bankrecSearchForm, lineItemContainer) {
    var [
      transactionType,
      transactionDate,
      transactionText,
    ] = [...lineItemContainer.querySelectorAll('.statement > .info > .details > span')].map(s => s.innerText);

    var regexInternationalMatchAttempts = new RegExp(overseasTransactionNames.join('|'), 'i');
    var internationalPayeeMatched = regexInternationalMatchAttempts.test(transactionText);

    if(internationalPayeeMatched) {
      document.getElementById('showBankCurrencyToggle').click();
    }

    document.querySelectorAll("#selectHeader .date a")[0].click();

    var searchNameInput = document.getElementById('searchNameText');
    searchNameInput.type = 'search';
    searchNameInput.addEventListener('search', () => enterInput(searchNameInput), false);
    searchNameInput.style['box-sizing'] = 'inherit';
    searchNameInput.focus();
    searchNameInput.select();

    if(internationalPayeeMatched || tryMatchEverything) {
      var result = internationalPayeeMatched ? regexInternationalMatchAttempts.exec(transactionText)[0] : transactionText;
      searchNameInput.value = result;
      enterInput(searchNameInput);
    }
  }

  // Find all 'Match' links
  var matchLinks = [...document.getElementsByClassName("t1")];
  var findAndMatchLinks = [...document.getElementsByClassName("t5")];
  var findAndMatchButtons = [...document.getElementsByClassName('info c1')].reduce((links, elem) => [...links, ...elem.getElementsByTagName('a')], []);

  // Listen for user clicking a match link to kick off logic
  [...matchLinks, ...findAndMatchLinks, ...findAndMatchButtons].map(link => link.addEventListener('click', waitForBankRecFormToLoad, false));
})();
