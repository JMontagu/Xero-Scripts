// Replaces reconcilled Statement Line Payee names with a plain HTML link
// This allows you to open the corresponding statement in a new window, 
// without losing your place

(function(w, doc) {
  // Check we're running this on the right page
  if(w.location.pathname !== '/Bank/Statements.aspx') {
    alert('Sorry, but this only works on the Bank Statements page');
    return;
  }

  // Get all table rows that are reconcilled
  var rows = doc.getElementById("statementDetails").querySelectorAll("tr.slg-row");
  
  // Get the current accountID from the page URL
  var accountId = /accountID=([\w\d-]*)/.exec(w.location.search)[1];

  // Loop through all the reconcilled rows
  for (var item of rows) {
    // get each line's unique ID
    var lineId = item.dataset.statementlineid;

    if(!lineId) {
      continue;
    }

    // Create the URL that will link to the transaction details for this given statement
    var transactionLink = 
    "https://go.xero.com/Bank/TransactionDetails.aspx?accountID=" 
    + accountId 
    + "&statementLineID=" 
    + lineId;

    // Get the 4th column of this row
    for(var cell of [].slice.call(item.querySelectorAll("td")).slice(3, 4)) {
      // stop the default Xero redirection happening when we click
      cell.addEventListener("click", 
        function(e) {
          e.stopPropagation();
        }, true);
      
      // Create a new link
      var newlink = doc.createElement('a');
      newlink.setAttribute('href', transactionLink);   
      
      // Set the text of the new link to this cell's text value
      newlink.textContent = cell.innerText;
      
      // Add the link to this cell, remove existing text
      cell.innerText = '';
      cell.appendChild(newlink);
    }
  }
})(window, document)
