require([
  "esri/Map",
  "esri/views/MapView",
  "esri/Graphic",
  "esri/layers/GraphicsLayer",
  "esri/symbols/SimpleMarkerSymbol",
  "esri/symbols/PictureMarkerSymbol", // Make sure to include the PictureMarkerSymbol module
  "esri/widgets/Slider"
], function(Map, MapView, Graphic, GraphicsLayer, SimpleMarkerSymbol, PictureMarkerSymbol, Slider) {

  var map = new Map({
      //basemap: "dark-gray" // A dark basemap provides a night-like appearance
      basemap: "topo"
  });

  var view = new MapView({
      container: "viewDiv",
      map: map,
      center: [0, 0], // The center of the map view when the page loads
      //center: [-98.5795, 39.8283],
      zoom: 4
  });

  var graphicsLayer = new GraphicsLayer();  
  map.add(graphicsLayer);   

  // Function to fetch and create points
  function createPointsFromCoordinates() {
    fetch('data/output.txt')
    //fetch('data/coordinates.txt')
    //fetch('data/us_points.txt')
      .then(response => response.text())
      .then(text => {
          var lines = text.trim().split("\n");
          //console.log("Data Loaded:", lines);
          lines.forEach(function(line) {
              var parts = line.split(';');
              //console.log("Parts split from line:", parts);
              if (parts.length >= 5) {
                  var id = parseFloat(parts[0].trim());
                  var lat = parseFloat(parts[1].trim());
                  var lon = parseFloat(parts[2].trim());
                  var count = parseInt(parts[3].trim());
                  var name = parts[4].trim();
                  var size = Math.max(5, count / 10);
                  console.log(`Creating point at ${lat}, ${lon} with size ${size}`); // Debug: log each point creation
                  console.log("Added point with attributes:", {
                    ID: id,
                    count: count,
                    name: name
                  });
                  var pointGraphic = new Graphic({
                    geometry: {
                      type:"point",
                      longitude: lon,
                      latitude: lat
                    },
                    symbol: new SimpleMarkerSymbol({
                      color: [255,97,0],
                      size: size + "px", 
                      outline: {
                        color:[255,255,255,0.5],
                        width:1
                      }
                    }),
                    attributes: {
                      ID: id,
                      count: count,
                      name: name
                    },

                  // Create a new PictureMarkerSymbol with your blurred image
                  //var pointGraphic = new Graphic({
                  //  geometry: {
                  //    type: "point",
                  //    longitude: lon,
                  //    latitude: lat
                  //  },
                  //  symbol: new PictureMarkerSymbol({
                  //    url: 'data/blurred_circle_marker_1.png', // The path to the blurred image
                  //    width: '1.5px',  
                  //    height: '1.5px'  
                  //  })

                    visible: false // initially hide the points
                  });
                  graphicsLayer.add(pointGraphic);
              }
          });
          if (graphicsLayer.graphics.length > 0) {
            view.goTo(graphicsLayer.graphics.toArray());
        }
      })
      .catch(function(error){
          console.error("Error fetching coordinates:", error);
      });
  }

    // Add slider
    var slider = new Slider({
      container: "sliderDiv",
      min: 0,
      max: 500, // Adjust max value as needed
      steps: 1,
      labelsVisible: true,
      rangeLabelsVisible: false,
      precision: 0 // Set precision to 0 to display integer values
    });

    document.getElementById('sliderDiv').addEventListener('input', function(event) {
      var value = event.target.value;
      console.log('Slider input event:', event.target.value);
      window.sliderValue = value;
      updateDataVisibility(value);
    });

    // Getting slider elements and elements used to display values
    var slider = document.getElementById('dataRangeSlider');
    var sliderValueSpan = document.getElementById('sliderValue');

    // update
    slider.addEventListener('input', function() {
      var value = slider.value;
      sliderValueSpan.textContent = value;
    });

    function updateDataVisibility(value) {
      console.log("Updating data visibility with slider value:", value);
    
      // Add only the graphics with count less than or equal to the slider value
      graphicsLayer.graphics.forEach(function(graphic) {
        var count = graphic.attributes.count;
        if (count <= value) {
          graphic.visible = true; // Set the graphic to be visible
        } else {
          graphic.visible = false; // Set the graphic to be hidden
        }
      });
    
      console.log("Graphics layer after updating visibility:", graphicsLayer.graphics);
    }    

  view.when(function() {
    // Wait for the view to load to ensure map is ready
    createPointsFromCoordinates();
  });
  
});