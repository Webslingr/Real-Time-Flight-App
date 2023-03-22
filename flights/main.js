(function(){

    var greenIcon = L.icon({
        iconUrl: 'plane2.png',
       
        //size of the icon
        iconSize:     [28, 28],
        
        //point of the icon which will correspond to marker's location
        iconAnchor:   [2, 24],

        //point from which the popup should open relative to the iconAnchor
        popupAnchor:  [-13, -36]
    });


    var geoJsonLayer;


    //create map in leaflet and tie it to the div called 'theMap'
    var map = L.map('theMap').setView([42, -60], 4);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

    // L.marker([42, -60]).addTo(map)
    //     .bindPopup('This is a sample popup. You can put any html structure in this including extra flight data. You can also swap this icon out for a custom icon. Some png files have been provided for you to use if you wish.')
    //     .openPopup();


//Function that will enclose the data and set a time that will 
//refresh all the data in that function
function refreshMap() { 
    
    console.log("Fetching neccessary data...");

    //Fetches the opensky data for all states
     fetch("https://opensky-network.org/api/states/all.")   
    .then(function(response){
        return response.json();
    })
    .then(function(json)
    {
        
        //Removes the data so the function can refresh the 
        //data every time the function is called   
        if(geoJsonLayer) {
            map.removeLayer(geoJsonLayer);
        }

        //Filters the data with only Canada included
        let filterCanada = json.states.filter(function(currentValue)
        {
            if(currentValue[2].includes("Canada"))
            {
            return currentValue
            } 
               
        })
         console.log(filterCanada)
        
         //Created a new variable and map the filter json array to convert them to geojson 
        let geoJsonArr = filterCanada.map(function(flight)

        {
            
            //Returns the json data into geojson format
            return {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [flight[5], flight[6]],
                    time_position:[flight[3]],
                    last_contact:[flight[4]],
                    baro_altitude:[flight[7]],
                    on_ground:[flight[8]],
                    velocity:[flight[9]],
                    true_track:[flight[10]],
                    vertical_rate:[flight[11]],
                    geo_altitude:[flight[13]],
                    postion_source:[flight[16]]


                },
                properties: {
                    icon: greenIcon,
                    address: [flight[0]],
                    callsign: [flight[1]],
                    origin_country:[flight[2]],
                    sensors:[flight[12]],
                    squawk:[flight[14]],
                    spi:[flight[16]],
                    popup_content:flight[2]?flight[2].toString():"0"

                }
            }
            
          

        });

        
        
        //created this function The onEachFeature option is a 
        //function that gets called on each feature before adding it to a GeoJSON layer this populates the 
        //popup content when the icon is click. 
        function onEachFeature(feature, layer) 
        {
            
            //The condition is to see if  this feature have a property named popupContent
            if (feature.properties && feature.properties.popup_content) 
            {
                layer.bindPopup("Air " +`${feature.properties.origin_country}<br/> Address: ${feature.properties.address}<br/> First Seen at: ${feature.geometry.time_position}<br/> 
                Estimated Departure Airport: ${feature.properties.address}  <br/> Last Seen: ${feature.geometry.last_contact}
                <br/> Altitude: ${feature.geometry.geo_altitude}`);
            }               

        }
       
        //Returns (north=0°) rotation angle of all iconand add them to the map.  
        geoJsonLayer = L.geoJSON(geoJsonArr, 
        {
        onEachFeature: onEachFeature,
        pointToLayer: function (feature, latlng) 
        {
            return L.marker(latlng, {icon: greenIcon, rotationAngle: feature.geometry.true_track})
        }
        }).addTo(map);

        //setting a refresh timer to refresh every 7 seconds
        setTimeout(refreshMap, 7000);
                            

    })


}
         
//function call
refreshMap();


})()

// NOTE:-
// Use setinterval and/or settimeout to refresh page.. USE recursive function

// e.g. myfunction(){
//      setTimeout(myfunction, 1000)
// }
// myfunction()