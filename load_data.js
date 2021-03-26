//
// let formatDollar = function(d) { return "$" + d3.format(",.0f")(d).replace(/G/,"B"); }
// let formatDollarMini = function(d) { return "$" + d3.format(".2s")(d).replace(/G/,"B"); }
let formatPercentDecimal = function (d) {
  return d3.format(".1f")(d) + "%";
};
let formatPercent = function (d) {
  return d3.format(".0f")(d) + "%";
};
let formatNumberMini = function (d) {
  if (d < 10) {
    return d3.format(".1s")(d).replace(/G/, "B");
  }
  if (d < 100) {
    return d3.format(".2s")(d).replace(/G/, "B");
  }
  return d3.format(".3s")(d).replace(/G/, "B");
};

var url = window.location.href;
var service_id = decodeURIComponent(url.split("?").pop());

// Testing variables
// var url = "search.open.canada.ca/chart/si/index-fr.html?1669";
// var service_id = url.split("?").pop();


// Service standards channels dictionary
var standard_channels = {
  onl: {
    en: 'Online',
    fr: 'En ligne'
  },
  tel: {
    en: 'Telephone',
    fr: 'Téléphone'
  },
  person: {
    en: 'In-Person',
    fr: 'En personne'
  },
  eml: {
    en: 'Email',
    fr: 'Courriel'
  },
  fax: {
    en: 'Fax',
    fr: 'Télécopieur'
  },
  post: {
    en: 'Postal Mail',
    fr: 'Courrier postal'
  },
  oth: {
    en: 'Other',
    fr: 'Autre'
  },
  non: {
    en: 'None',
    fr: 'Aucune des réponses'
  }
}

var fr_page = false; 

if (url.indexOf("index-fr.html") > -1) {
  fr_page = true;
  $("#toggle").attr("href", "index-en.html?" + service_id);
} else {
  $("#toggle").attr("href", "index-fr.html?" + service_id);
}

function sumTransactions(service) {
  var online_applications =
    service[0]["online_applications"] == ("" || "ND")
      ? 0
      : parseInt(service[0]["online_applications"]);
  var in_person_applications =
    service[0]["in_person_applications"] == ("" || "ND")
      ? 0
      : parseInt(service[0]["in_person_applications"]);
  var telephone_applications =
    service[0]["telephone_applications"] == ("" || "ND")
      ? 0
      : parseInt(service[0]["telephone_applications"]);
  var other_applications =
    service[0]["other_applications"] == ("" || "ND")
      ? 0
      : parseInt(service[0]["other_applications"]);
  var postal_mail_applications =
    service[0]["postal_mail_applications"] == ("" || "ND")
      ? 0
      : parseInt(service[0]["postal_mail_applications"]);
  return (
    online_applications +
    in_person_applications +
    telephone_applications +
    other_applications +
    postal_mail_applications
  );
}

function consumeData(error, services_data, standards_data) {
  if (error) {
    console.log("Error on data load");
  }

  var year_data = _.chain(services_data).groupBy("fiscal_yr").value();

  var service_16_17 = _.filter(year_data["2016-2017"], function (row) {
    return !isNaN(row["service_id"]) && service_id === row["service_id"];
  });
  
  var service_17_18 = _.filter(year_data["2017-2018"], function (row) {
    return !isNaN(row["service_id"]) && service_id === row["service_id"];
  });

  var service_18_19 = _.filter(year_data["2018-2019"], function (row) {
    return !isNaN(row["service_id"]) && service_id === row["service_id"];
  });

  var service_19_20 = _.filter(year_data["2019-2020"], function (row) {
    return !isNaN(row["service_id"]) && service_id === row["service_id"];
  });

  console.log([service_16_17, service_17_18, service_18_19, service_19_20 ]);

  // Sum of transactions
  var sum_transactions_16_17 =
    service_16_17.length > 0 ? sumTransactions(service_16_17) : null;
  var sum_transactions_17_18 =
    service_17_18.length > 0 ? sumTransactions(service_17_18) : null;
  var sum_transactions_18_19 =
    service_18_19.length > 0 ? sumTransactions(service_18_19) : null;
  var sum_transactions_19_20 =
    service_19_20.length > 0 ? sumTransactions(service_19_20) : null;
  var service =
    service_19_20.length > 0
      ? service_19_20
      : service_18_19.length > 0
      ? service_18_19
      : service_17_18.length > 0
      ? service_17_18
      : service_16_17.length > 0
      ? service_16_17 : null; //takes the latest service report that exists

  console.log(service);

  function drawChart2() {
    var serviceSum = [];
    var labels = [];
    if (sum_transactions_16_17 > 0) {
      serviceSum.push(sum_transactions_16_17);
      labels.push("2016-17");
    }
    if (sum_transactions_17_18 > 0) {
      serviceSum.push(sum_transactions_17_18);
      labels.push("2017-18");
    }
    if (sum_transactions_18_19 > 0) {
      serviceSum.push(sum_transactions_18_19);
      labels.push("2018-19");
    }
    if (sum_transactions_19_20) { //Client request: for the last year, display it in the chart as long as it exists, even if it has an applications sum of 0
      serviceSum.push(sum_transactions_19_20);
      labels.push("2019-20");
    }

    if (serviceSum.length > 0) {
      drawBarChart(serviceSum, labels);
    } else {
      if (service[0]["info_service"] == "Y") {
        $("#total_applications_null").html(fr_page ? "Ce service fournit de l'information et ne possède aucune demande." : "This service provides information and has no applications.");
      }
      $("#total_applications_null").show();
      $("#chart2").hide();
    }
  }

  //online percentage
  if (
    service[0]["online_applications"] != ("" || "ND") &&
    sumTransactions(service) > 0
  ) {
    var online_applications = parseInt(service[0]["online_applications"]);
    var online_percent = (100 * online_applications) / sumTransactions(service);
    console.log(online_percent);
    $("#online_percent").html(formatPercent(online_percent));
    $("#online_percent_section").show();
  }

  //Append service title & description
  if (fr_page) {
    $("h1").html(
      service[0]["service_name_fr"] + ": Tableau de bord sur le rendement"
    );
    $("#service_title").html(
      "<b>Titre du service</b> : " + service[0]["service_name_fr"]
    );
    var org_name = service[0]["department_name_fr"];
    $("#service_department").html("<b>Ministère</b> : " + org_name);
    $("#service_description").html(
      "<b>Description du service</b>:<p>" + service[0]["service_description_fr"] + "</p>"
    );
    $("#service_fee").html(
      "<b>Frais de service</b> : " +
        (service[0]["service_fee"] == "Y"
          ? "Ce service comporte des frais de service."
          : "Ce service ne comporte aucun frais de service.")
    );
    if (validURL(service[0]["service_url_fr"])) {
      $("#service_url").html(
        '<b>Lien au service</b> : <a class="btn btn-default" href="' +
          service[0]["service_url_fr"] +
          '">Accedez ici</a>'
      );
    }
  } else {
    $("h1").html(service[0]["service_name_en"] + ": Performance Dashboard");
    $("#service_title").html(
      "<b>Service name</b>: " + service[0]["service_name_en"]
    );
    var org_name = service[0]["department_name_en"];
    $("#service_department").html("<b>Department</b>: " + org_name);
    $("#service_description").html(
      "<b>Service description</b>:<p>" + service[0]["service_description_en"] + "</p>"
    );
    $("#service_fee").html(
      "<b>Service fees</b>: " +
        (service[0]["service_fee"] == "Y"
          ? "This service has service fees."
          : "This service does not have any service fees.")
    );
    if (validURL(service[0]["service_url_en"])) {
      $("#service_url").html(
        '<b>Link to service</b> : <a class="btn btn-default" href="' +
          service[0]["service_url_en"] +
          '">Access here</a>'
      );
    }
  }

  // e-enablement

  var e_enablement = {
    e_registration: service[0]["e_registration"],
    e_authentication: service[0]["e_authentication"],
    e_application: service[0]["e_application"],
    e_decision: service[0]["e_decision"],
    e_issuance: service[0]["e_issuance"],
    e_feedback: service[0]["e_feedback"],
  };
  loadEnablementTable(e_enablement);

  //Service fee
  var service_fee = service[0]["e_feedback"];

  //target data
  var standards = _.filter(standards_data, function (row) {
    return (
      service[0]["service_id"] === row["service_id"] &&
      service[0]["fiscal_yr"] === row["fiscal_yr"]
    );
  });
  console.log(standards);
  function drawChart1() {
    if (standards.length > 0) {
      var targets_met = _.filter(standards, function (obj) {
        return (
          Math.ceil(parseFloat(obj["performance"])) >=
          parseFloat(obj["service_std_target"])
        );
      });
      var avrg_target =
        _.reduce(
          _.pluck(standards, "service_std_target"),
          function (memo, num) {
            return memo + parseFloat(num);
          },
          0
        ) / standards.length;
      var avrg_performance =
        _.reduce(
          _.pluck(standards, "performance"),
          function (memo, num) {
            return memo + parseFloat(num);
          },
          0
        ) / standards.length;
      drawDoughnutChart(targets_met.length, standards.length);
    } else {
      $("#standards").attr("style", "display: none");
      fr_page
        ? $("#standards-note").html(
            "Note: Aucuns standards de service ont été collectés pour ce service."
          )
        : $("#standards-note").html(
            "Note: No service standard information was collected for this service."
          );
    }
  }

  // Populate service standards table
  var tableData = _.map(standards, function (standard) {
    if (fr_page) {
      var tableFormat = {
        "Norme relative aux services": standard.service_std_fr,
        "Moyen": standard_channels[standard.channel].fr,
        Objectif:
          standard.service_std_target != "ND"
            ? formatPercent(Math.ceil(parseFloat(standard.service_std_target)))
            : "ND",
        Résultat:
          standard.performance != "ND"
            ? formatPercent(Math.ceil(parseFloat(standard.performance)))
            : "ND",
      };
    } else {
      var tableFormat = {
        "Service standard": standard.service_std_en,
        "Channel": standard_channels[standard.channel].en,
        Target:
          standard.service_std_target != "ND"
            ? formatPercent(Math.ceil(parseFloat(standard.service_std_target)))
            : "ND",
        Result:
          standard.performance != "ND"
            ? formatPercent(Math.ceil(parseFloat(standard.performance)))
            : "ND",
      };
    }
    return tableFormat;
  });
  populateTable(tableData);

  // Animate Chart drawing using Materialize
  var options = [
    { selector: "#chart2", offset: 50, callback: drawChart2 },
    { selector: "#chart1", offset: 50, callback: drawChart1 },
  ];
  Materialize.scrollFire(options);
}

function validURL(str) {
  var pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator
  return !!pattern.test(str);
}

d3.queue()
  .defer(d3.csv, "service_inventory.csv")
  .defer(d3.csv, "service_standards.csv")
  // .defer(d3.csv, 'https://open.canada.ca/data/dataset/3ac0d080-6149-499a-8b06-7ce5f00ec56c/resource/3acf79c0-a5f5-4d9a-a30d-fb5ceba4b60a/download/service.csv')
  // .defer(d3.csv, 'https://open.canada.ca/data/dataset/3ac0d080-6149-499a-8b06-7ce5f00ec56c/resource/272143a7-533e-42a1-b72d-622116474a21/download/service-std.csv')
  .await(consumeData); //only function name is needed
