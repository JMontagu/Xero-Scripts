// ==UserScript==
// @name       Xero Bank Statements
// @version    1.0.0
// @author     Jade Montagu
// @homepage   https://github.com/jmontagu/xero-scripts
// @updateURL  https://github.com/JMontagu/Xero-Scripts/raw/master/ImportedBankStatements.user.js
// @downloadURL https://github.com/JMontagu/Xero-Scripts/raw/master/ImportedBankStatements.user.js
// @supportURL  https://github.com/JMontagu/Xero-Scripts/issues
// @description  Makes reconcilled Bank Statement lines 'clickable' (i.e, you can choose to open in a new tab/window)
// @match https://go.xero.com/Bank/Statements.aspx*
// @run-at document-end
// ==/UserScript==

// Replaces reconcilled Statement Line Payee names with a plain HTML link
// This allows you to open the corresponding statement in a new window,
// without losing your place

(function() {
  // Get the current accountID from the page URL
  var accountId = /accountID=([\w\d-]*)/.exec(window.location.search)[1];

  var table = document.getElementById("main-panel").querySelectorAll(".x-plain-bwrap .x-panel")[1];

  var observer = new MutationObserver(function(mutations) {
    mutations.filter(function(mutation) { return mutation.type === 'childList'; }).forEach(function(mutation) {
      if(!mutation.addedNodes[0]) {
          return;
      }
        
      var rows = mutation.addedNodes[0].querySelectorAll("tr.slg-row");
      
      htmlifyTableRows(rows);
    });    
  });
      
  observer.observe(table, {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true
  });

  function htmlifyTableRows(rows) {
    for (var item of rows) {
      // get each line's unique ID
      var lineId = item.dataset.statementlineid;

      if(!lineId) {
          continue;
      }

      // Create the URL that will link to the transaction details for this given statement
      var transactionLink = 
          "https://go.xero.com/Bank/TransactionDetails.aspx?accountID=" + accountId + "&statementLineID=" + lineId;

      // Get the 3th column of this row (Payee)
      for(var cell of [].slice.call(item.querySelectorAll("td")).slice(3, 4)) {
          // stop the default Xero redirection happening when we click this cell
          cell.addEventListener("click", 
            function(e) {
              e.stopPropagation();
            },
            true);

          // Create a new link
          var newlink = document.createElement('a');
          newlink.setAttribute('href', transactionLink);   

          // Set the text of the new link to this cell's text value
          newlink.textContent = cell.innerText;

          // Add the link to this cell and remove the existing text
          cell.innerText = '';
          cell.appendChild(newlink);
      }
    }
  }
})();