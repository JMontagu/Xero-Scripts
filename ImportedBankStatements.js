// Replaces reconcilled Statement Line Payee names with a plain HTML link
// This allows you to open the corresponding statement in a new window, 
// without losing your place

(function(w, doc) {
  if(w.location.pathname !== '/Bank/Statements.aspx') {
    alert('Sorry, but this only works on the Bank Statements page');
    return;
  }

  var rows = doc.getElementById("statementDetails").querySelectorAll("tr.slg-row");
  var accountId = /accountID=([\w\d-]*)/.exec(w.location.search)[1];

  for (var item of rows) {
    var lineId = item.dataset.statementlineid;

    if(!lineId) {
      continue;
    }

    var transactionLink = 
    "https://go.xero.com/Bank/TransactionDetails.aspx?accountID=" 
    + accountId 
    + "&statementLineID=" 
    + lineId;

    for(var cell of [].slice.call(item.querySelectorAll("td")).slice(3, 4)) {
      cell.addEventListener("click", 
        function(e) {
          e.stopPropagation();
        }, true);
      
      var newlink = doc.createElement('a');
      newlink.setAttribute('href', transactionLink);    
      newlink.textContent = cell.innerText;
      cell.innerText = '';
      cell.appendChild(newlink);
    }
  }
})(window, document)
