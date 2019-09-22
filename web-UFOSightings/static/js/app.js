// from data.js
var tableData = data;

// get reference to table body
var tbody = d3.select("tbody");

// define function to render table with dataset
function renderTable(arrTableData) {

    // iterate through sightings data and append rows (and cells) to table for each entry
    arrTableData.forEach((sighting) => {
        var row = tbody.append("tr");
        Object.entries(sighting).forEach(([key, value]) => {
        var cell = row.append("td");
        cell.text(value);
        });
    });

}

// define function to clear rows out of table
function clearTable() {

    tbody.selectAll("tr").remove();

}


renderTable(tableData);

///////////////////////////////////////////// 
/////// SETUP FILTERING CAPABILITY //////////
///////////////////////////////////////////// 

// function to filter table based on filter value
function filterTable(filterObject) {

    console.log(filterObject);

    // create filtered data set by calling filter function with datetime critera based on input value
    var filteredData = tableData.filter(function(sighting) {
        for (var key in filterObject) {
            if ((sighting[key] == undefined) || 
                ((filterObject[key] != "") &&
                 (sighting[key].toLowerCase() != filterObject[key].toLowerCase())
                )
               )
              return false;
          }
          return true;
        });  

    console.log(filteredData);
  
    // clear table rows
    clearTable();
  
    // re-populate table with filtered data set
    renderTable(filteredData);
}

// function to get object of values from input elements
function getInputObject() {

  // Select the input elements and get the raw HTML nodes
  var inputDate = d3.select("#datetime");
  var inputCity = d3.select("#city");
  var inputState = d3.select("#state");
  var inputCountry = d3.select("#country");
  var inputShape = d3.select("#shape");

  // Get the value property of the input elements and return as js object
    return {
        datetime: inputDate.property("value"),
        city: inputCity.property("value"),
        state: inputState.property("value"),
        country: inputCountry.property("value"),
        shape: inputShape.property("value")
    }
}

// Select the button
var filter_button = d3.select("#filter-btn");
var reset_button = d3.select("#reset-btn")

// define event listener to prevent default submission
d3.select("form").on("submit", function(event){
    console.log('preventing page refresh on form submission');
    d3.event.preventDefault();
    return false;
});

// define event listener for filter button clicks
filter_button.on("click", function() {

  // get the input elements into an array
  var inputObject = getInputObject();

  // pass filter values to function to refresh table
  filterTable(inputObject);

});

// define event listener for reset button clicks
reset_button.on("click", function() {
  
    // clear table
    clearTable();

    // refresh table with full data set
    renderTable(tableData);
  
});

