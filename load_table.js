
function loadEnablementTable(e_enablement) {
  console.log(e_enablement);
  let table = document.getElementById('e_enablement');
  for (index in e_enablement) {
    var row = document.getElementById(index);
    var cell = row.insertCell(1);
    if (e_enablement[index] == "Y") {
      (fr_page) ? cell.innerHTML = '<span class="glyphicon glyphicon-ok"></span> Oui' : cell.innerHTML = '<span class="glyphicon glyphicon-ok"></span> Yes';
      cell.setAttribute("style","color:green; white-space: nowrap;");
      console.log(cell);
    } else if (e_enablement[index] == "N") {
      (fr_page) ? cell.innerHTML = '<span class="glyphicon glyphicon-remove"></span> Non' : cell.innerHTML = '<span class="glyphicon glyphicon-remove"></span> No';
      cell.setAttribute("style","color:#CD0000; white-space: nowrap;");
      console.log(cell);
    } else {
      (fr_page) ? cell.innerHTML = 'Ne s’applique pas à ce service' : cell.innerHTML = 'Not applicable for this service';
      cell.setAttribute("style","color:grey");
    }


  }
}





function populateTable(data, id) {

  let tableData = _.map(data, function(obj) {
    return _.values(obj);
  });

  let headers = _.map(_.keys(data[0]), function(header) {
    return { title: header };
  });

  if (data.length > 0) {
    $(document).ready(function() {
      $('#table2').DataTable( {
        autoWidth : false,
        paging : false,
        searching : false,
        bInfo : false,
        data: tableData,
        columns: headers
      });
    });
  }


}
