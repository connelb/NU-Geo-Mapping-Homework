var timeFmt = d3.timeFormat("%I:%M")

var quakeMarkers = L.layerGroup();
var tectonicshapes = L.layerGroup();

// Grabbing our GeoJSON data..
var link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson";
d3.json(link, function (data) {
  for (i = 0; i < data['features'].length; i++) {

    var quakeMarker = L.circle([+data['features'][i].geometry.coordinates[1], +data['features'][i].geometry.coordinates[0]],
      {
        stroke: true,
        fillOpacity: 0.75,
        color: getColor(data['features'][i]['properties']['mag']),
        fillColor: getColor(data['features'][i]['properties']['mag']),
        radius: markerSize(data['features'][i]['properties']['mag'])
      })

    //Binding a pop-up
    quakeMarker.bindPopup("<p><strong>Location: </strong>" + data['features'][i]['properties']['place'] + "<br /><strong>Time occurrence: </strong>" + timeFmt(new Date(data['features'][i]['properties']['time'])) + "</p>")//, );

    quakeMarker.addTo(quakeMarkers);
  }
})
console.log('quakeMarkers', quakeMarkers)


// Grabbing tectonic GeoJSON data..
var tectonic = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"
d3.json(tectonic, data => {

  var tectonicshape = L.geoJson(data, {
    style: function (feature) {
      return {
        color: "white",
        fillColor: 'black',
        fillOpacity: 0.5,
        weight: 1.5
      };
    }
  })

  tectonicshape.addTo(tectonicshapes);
})

// Define variables for our base layers
var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.streets",
  accessToken: API_KEY
});

var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.dark",
  accessToken: API_KEY
});


var myMap = L.map("map", {
  center: [41.8781, -87.6298],
  zoom: 3,
  layers: [streetmap, quakeMarkers]
})

// Create a baseMaps object
var baseMaps = {
  "Street Map": streetmap,
  "Dark Map": darkmap
};

// Create an overlay object
var overlayMaps = {
  "Quakes": quakeMarkers,
  "Tectonic Lines": tectonicshapes
};

// Pass our map layers into our layer control
// Add the layer control to the map
L.control.layers(baseMaps, overlayMaps).addTo(myMap);

// Setting up the legend
var legend = L.control({ position: "bottomright" });
legend.onAdd = function () {
  var div = L.DomUtil.create("div", "info legend");
  var limits = [1, 2, 3, 4, 5];
  var colors = ['green', 'lime', 'yellow', 'orange', 'red'];
  var labels = [];

  var legendInfo = "<h5>Magnitude:</h5>"

  div.innerHTML = legendInfo;
  for (var i = 0; i < limits.length; i++) {
    div.innerHTML +=
      '<i style="background:' + getColor(limits[i] + 1) + '"></i> ' +
      limits[i] + (limits[i + 1] ? '&ndash;' + limits[i + 1] + '<br>' : '+');
  }

  return div;
};

// Adding legend to the map
legend.addTo(myMap);


function markerSize(mag) {
  return mag * 10000 * 2;
}

function getColor(d) {
  return d > 5 ? '#800026' :
    d > 4 ? '#BD0026' :
      d > 3 ? '#E31A1C' :
        d > 2 ? '#FC4E2A' :
          d > 1 ? '#FD8D3C' :
            d > 0 ? '#FEB24C' :
              '#FFEDA0';
}