//
// let formatDollar = function(d) { return "$" + d3.format(",.0f")(d).replace(/G/,"B"); }
// let formatDollarMini = function(d) { return "$" + d3.format(".2s")(d).replace(/G/,"B"); }
let formatPercentDecimal = function(d) { return d3.format(".1f")(d) + "%"; }
let formatPercent = function(d) { return d3.format(".0f")(d) + "%"; }
let formatNumberMini = function(d) { return d3.format(".2s")(d).replace(/G/,"B"); }

// var url = window.location.href;
// var service_id = decodeURIComponent(url.split('?').pop());

// Testing variables
var url = 'chercher.ouvert.canada.ca/chart/si/index-fr.html?cbsa-asfc - 02';
var service_id = url.split('?').pop();
console.log(service_id);

var fr_page = false;

if (url.indexOf('index-fr.html') > -1) {
  fr_page = true;
  $('#toggle').attr('href','index-en.html?' + service_id);
} else {
  $('#toggle').attr('href','index-fr.html?' + service_id);
}
// console.log('id: ' + service_id);
// console.log('URL: ' + window.location.href);

function sumTransactions(service) {
  var online_applications = (service[0]['online_applications'] == "") ? 0 : parseInt(service[0]['online_applications']);
  var calls_received = (service[0]['calls_received'] == "") ? 0 : parseInt(service[0]['calls_received']);
  var in_person_applications = (service[0]['in_person_applications'] == "") ? 0 : parseInt(service[0]['in_person_applications']);
  var email_applications = (service[0]['email_applications'] == "") ? 0 : parseInt(service[0]['email_applications']);
  var fax_applications = (service[0]['fax_applications'] == "") ? 0 : parseInt(service[0]['fax_applications']);
  var postal_mail_applications = (service[0]['postal_mail_applications'] == "") ? 0 : parseInt(service[0]['postal_mail_applications']);
  return online_applications + calls_received + in_person_applications + email_applications + fax_applications + postal_mail_applications
}

function consumeData(error, services_data, standards_data) {

  if (error){
      console.log("Error on data load");
  }

  var year_data =  _.chain(services_data).groupBy('fiscal_yr').value();

  var service_17_18 = _.filter(year_data['2017-2018'], function (row) {
    return service_id === row['New_Service_ID'];
  });

  var service_16_17 = _.filter(year_data['2016-2017'], function (row) {
    return service_id === row['New_Service_ID'];
  });

  // Sum of transactions
  var sum_transactions_16_17 = (service_16_17.length > 0) ? sumTransactions(service_16_17) : 0;
  var sum_transactions_17_18 = (service_17_18.length > 0) ? sumTransactions(service_17_18) : 0;
  var service = (service_17_18.length > 0) ? service_17_18 : service_16_17;
  function drawChart2() {
    drawBarChart(sum_transactions_16_17, sum_transactions_17_18);
  }



  console.log("sum_transactions_16_17 " + sum_transactions_16_17);
  console.log("sum_transactions_17_18 " + sum_transactions_17_18);
  console.log(service);

  //Append service title & description
  if (fr_page) {
    $('h1').html(service[0]['Edited_Service_Name_FR'] + ': Tableau de bord sur le rendement');
    $('#service_title').html('<b>Titre du service</b> : ' + service[0]['Edited_Service_Name_FR']);
    var org_name = service[0]['Org Name'].split(" | ")[1];
    $('#service_department').html('<b>Ministère</b> : ' + org_name);
    $('#service_description').html('<b>Description du service</b> : ' + service[0]['service_description_fr']);
    $('#service_year').html('<b>Année de la déclaration</b> : ' + service[0]['fiscal_yr']);
    $('#service_fee').html('<b>Frais de service</b> : ' + ((service[0]['service_fee'] == 'Y') ? 'Ce service comporte des frais de service.' : 'Ce service ne comporte aucun frais de service.'));
    $('#service_url').html('<b>Lien au service</b> : <a class="btn btn-default" href="'+ service[0]['service_url_fr'] +'">Accedez ici</a>');
  } else {
    $('h1').html(service[0]['Edited_Service_Name_EN'] + ': Performance Dashboard');
    $('#service_title').html('<b>Service name</b>: ' + service[0]['Edited_Service_Name_EN']);
    var org_name = service[0]['Org Name'].split(" | ")[0];
    $('#service_department').html('<b>Department</b>: ' + org_name);
    $('#service_description').html('<b>Service description</b>: ' + service[0]['service_description_en']);
    $('#service_year').html('<b>Year reported</b>: ' + service[0]['fiscal_yr']);
    $('#service_fee').html('<b>Service fees</b>: ' + ((service[0]['service_fee'] == 'Y') ? 'This service has service fees.' : 'This service does not have any service fees.'));
    $('#service_url').html('<b>Link to service</b> : <a class="btn btn-default" href="'+ service[0]['service_url_en'] +'">Access here</a>');
  }



  //online percentage
  var online_applications = (service[0]['online_applications'] == "") ? 0 : parseInt(service[0]['online_applications']);
  var online_percent = (service_17_18.length == 0 ) ? 100 * online_applications/sum_transactions_16_17 : (sum_transactions_17_18 > 0) ? 100 * online_applications/sum_transactions_17_18 : 0;
  console.log("online_percent: " + online_percent);
  $('#online_percent').html(formatPercent(online_percent));

  // e-enablement

  var e_enablement = {
    'e_registration' : service[0]['e_registration'],
    'e_authentication' : service[0]['e_authentication'],
    'e_application' : service[0]['e_application'],
    'e_decision' : service[0]['e_decision'],
    'e_issuance' : service[0]['e_issuance'],
    'e_feedback' : service[0]['e_feedback']
  };
  loadEnablementTable(e_enablement);

  //Service fee
  var service_fee = service[0]['e_feedback'];



  //target data
  var standards = _.filter(standards_data, function(row) {
    return service[0]['New_Service_ID'] === row['New Service ID'];
  });
  console.log(standards);
  function drawChart1() {
    if(standards.length > 0) {
      var targets_met = _.filter(standards, function(obj) { return parseFloat(obj['performance'].replace('%','')) >= parseInt(obj['service_std_target'].replace('%','')) });
      console.log("targets_met: " + targets_met.length);
      var avrg_target = _.reduce(_.pluck(standards, 'service_std_target'), function(memo, num) { return memo + parseInt(num.replace('%','')) },0)/standards.length;
      var avrg_performance = _.reduce(_.pluck(standards, 'performance'), function(memo, num) { return memo + parseInt(num.replace('%','')) },0)/standards.length;
      console.log("avrg_target: " + avrg_target);
      console.log("avrg_performance: " + avrg_performance);
      drawDoughnutChart(targets_met.length, standards.length);
    } else {
      $('#standards').attr('style','display: none');
      (fr_page) ? $('#standards-note').html('Note: Aucuns standards de service ont été collectés pour ce service.') : $('#standards-note').html('Note: No service standard information was collected for this service.');
    }
  }


  // Populate service standards table
  var tableData = _.map(standards, function(standard) {
    console.log(standard);
    if(fr_page) {
      var tableFormat = {
        'Norme relative aux services' : standard.service_std_fr,
        'Objectif' : (standard.service_std_target != '') ? formatPercentDecimal(parseInt(standard.service_std_target)) : '',
        'Résultat' : formatPercentDecimal(parseFloat(standard.performance))
      };
    } else {
      var tableFormat = {
        'Service standard' : standard.service_std_en,
        'Target' : (standard.service_std_target != '') ? formatPercentDecimal(parseInt(standard.service_std_target)) : '',
        'Result' : formatPercentDecimal(parseFloat(standard.performance))
      };
    }
    return tableFormat;
  });
  populateTable(tableData);


  // Animate Chart drawing using Materialize
  var options = [
    {selector: '#chart2', offset:50, callback: drawChart2},
    {selector: '#chart1', offset:50, callback: drawChart1}
  ];
  Materialize.scrollFire(options);

}





d3.queue()
  .defer(d3.csv, 'service-inventory-services.csv')
  .defer(d3.csv, 'service-standards.csv')
  .await(consumeData); //only function name is needed
