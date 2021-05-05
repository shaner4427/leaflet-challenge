var quakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(quakeUrl).then(function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p><h5><hr><p>" +"Magnitude: " + (feature.properties.mag) +"Depth: " + (feature.geometry.coordinates[2]) +"</p></h5>");
 
  }

  function getColor(depth) {
    switch (true) {
      case depth > 40:
        return "#e70000";
      case depth > 30:
        return "#1e90e5";
      case depth > 20:
        return "#60b2ac";
      case depth > 10:
        return "#94cd7e";
      case depth > 1:
        return "#c4e754";
      default:
        return "#f3ff2c";
    }
  }

  function quakeCircle(feature) {
    return {
      radius: feature.properties.mag * 7,
      fillColor: getColor(feature.geometry.coordinates[2]),
      color: "grey",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.7,
    };
  }

  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },
    style: quakeCircle,
    onEachFeature: onEachFeature,
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, earthquakes],
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  var legend = L.control({ position: "topright" });

  legend.onAdd = function () {
    var div = L.DomUtil.create("div", "info legend");
    var grades = [1, 10, 20, 30, 40];
    var colors = ["#f3ff2c", "#c4e754", "#94cd7e", "#60b2ac", "#1e90e5", "#e70000"];

    var legendInfo = "<h3>Depth of Earthquakes</h3>"
    div.innerHTML = legendInfo;

    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
        "<i style='background: " +
        colors[i] +
        "'></i> " +
        grades[i] +
        (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<p>" : "+");
    }

    return div;
  };


  legend.addTo(myMap);

}




