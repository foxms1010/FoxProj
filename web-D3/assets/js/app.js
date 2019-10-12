// ======================================
// Setup Global Variables and Objects
// ======================================
var csvFile = "./assets/data/data.csv";

var svgWidth = 800;
var svgHeight = 600;

var margin = {
  top: 30,
  right: 50,
  bottom: 120,
  left: 120
};

var xLabels = {
  "poverty": "In Poverty (%)",
  "age": "Age (Median)",
  "income": "Household Income (Median)"
};

var yLabels = {
  "healthcare": "Lacks Healthcare (%)",
  "smokes": "Smokes (%)",
  "obesity": "Obese (%)"
};

var activeStates = {
  "true": "active",
  "false": "inactive"
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

//======================================
//===== End Global Variables   =========
//======================================

//======================================
//==== Define Helper Functions =========
//======================================

// function used for updating x-scale var upon click on axis label
function xScale(stateData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(stateData, d => d[chosenXAxis]) * .95,
      d3.max(stateData, d => d[chosenXAxis]) * 1.05
    ])
    .range([0, width]);

  return xLinearScale;
}

// function used for updating x-scale var upon click on axis label
function yScale(stateData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(stateData, d => d[chosenYAxis]) * .95,
      d3.max(stateData, d => d[chosenYAxis]) * 1.05
    ])
    .range([height, 0]);

  return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderAxesX(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating xAxis var upon click on axis label
function renderAxesY(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles and labels with a transition to
// new axis
function moveElements(elementGroup, attrToChange, newScale, chosenAxis) {

  elementGroup.transition()
    .duration(1000)
    .attr(attrToChange, d => newScale(d[chosenAxis]));

  return elementGroup;
}

// function used for updating new tooltip
function updateToolTip(chosenXAxis, chosenYAxis) {

  // setup style, position and label for tooltip
  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([-5, 75])
    .html(function(d) {
      return (`${d.state}<br><br>${xLabels[chosenXAxis]}: ${d[chosenXAxis]}<br>${yLabels[chosenYAxis]}: ${d[chosenYAxis]}`);
    });

  // add tooltip to chartgroup
  chartGroup.call(toolTip);

  return toolTip;
}

// function used to update hide/show actions for toolTip
function updateToolTipActions(toolTip, elementGroup) {
  elementGroup.on("mouseover", function(data) {
    toolTip.show(data);
    d3.select(this).attr("stroke-width", "2");
  }).on("mouseout", function(data, index) {
      toolTip.hide(data);
      d3.select(this).attr("stroke-width","0");
    });

  return elementGroup;
}

//======================================
//====   End Helper Functions  =========
//======================================

//======================================
//======= MAIN EXECUTION ===============
//======================================

// Import Data
d3.csv(csvFile).then(function(stateData) {

  // DEBUG/INFO
  console.log(stateData);

  // Parse Data/Cast as numbers
  // ==============================
  stateData.forEach(stateEntry => {
    stateEntry.poverty = +stateEntry.poverty;
    stateEntry.healthcare = +stateEntry.healthcare;
    stateEntry.income = +stateEntry.income;
    stateEntry.obesity = +stateEntry.obesity;
    stateEntry.smokes = +stateEntry.smokes;
    stateEntry.age = +stateEntry.age;
  });

  // Create scale functions
  // ==============================
  var xLinearScale = xScale(stateData, chosenXAxis);
  var yLinearScale = yScale(stateData, chosenYAxis);

  // Create axis functions
  // ==============================
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // Append Axes to the chart
  // ==============================
  var xAxis = chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  var yAxis = chartGroup.append("g")
    .call(leftAxis);

  // Create Circles
  // ==============================
  var circlesGroup = chartGroup.selectAll("circle")
  .data(stateData)
  .enter()
  .append("circle")
  .attr("cx", d => xLinearScale(d[chosenXAxis]))
  .attr("cy", d => yLinearScale(d[chosenYAxis]))
  .attr("r", "15")
  .attr("fill", "DeepSkyBlue")
  .attr("stroke", "black")
  .attr("stroke-width", 0)
  ;

  // Create Text Data Labels
  // ==============================
  var labelsGroup = chartGroup.selectAll(".data-label")
  .data(stateData)
  .enter()
  .append("text")
  .attr("class", "data_label")
  .attr("text-anchor", "middle")
  .attr("dominant-baseline", "middle")
  .attr("x", d => xLinearScale(d[chosenXAxis]))
  .attr("y", d => yLinearScale(d[chosenYAxis]))
  .attr("fill", "white")
  .text(d => d.abbr)
  ;

  // Create Transparent Circles to Capture mouse events
  // ==============================
  var circlesClearGroup = chartGroup.selectAll(".clear-circle")
  .data(stateData)
  .enter()
  .append("circle")
  .attr("class", "clear-circle")
  .attr("cx", d => xLinearScale(d[chosenXAxis]))
  .attr("cy", d => yLinearScale(d[chosenYAxis]))
  .attr("r", "15")
  .attr("stroke", "Navy")
  .attr("stroke-width", 0)
  .attr("fill-opacity", 0)
  ;

  // Setup x-Axis Labels/Selectors
  // ===============================
  var yOffset = 20;
  var activeState = "true";
  var xLabelElements = [];
  var xLabelsGroup = chartGroup.append("g")
  .attr("transform", `translate(${width / 2}, ${height + 20})`);

  // create new xAxis label for each entry in xLabels object
  Object.entries(xLabels).forEach(([key, value]) => {
    var xAxisLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", yOffset)
    .attr("value", key) // value to grab for event listener
    .classed(activeStates[activeState], "true")
    .text(value);

    yOffset += 20;
    activeState = "false";
    xLabelElements[key] = xAxisLabel;
  });

  // Setup y-Axis Labels/Selectors
  // ===============================
  var xOffset = 20;
  activeState = "true";
  var yLabelElements = [];
  var yLabelsGroup = chartGroup.append("g")
  .attr("transform", `translate(${-margin.left * .8 }, ${height / 2}) rotate(-90)`);

  // create new yAxis label for each entry in yLabels object
  Object.entries(yLabels).forEach(([key, value]) => {
    var yAxisLabel = yLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", xOffset) // use xOffset on y attr since we have rotated the group
    .attr("value", key) // value to grab for event listener
    .classed(activeStates[activeState], "true")
    .text(value);

    xOffset += 20;
    activeState = "false";
    yLabelElements[key] = yAxisLabel;
  });

  // Update tool tip for chosen axes
  // ==============================
  var newToolTip = updateToolTip(chosenXAxis, chosenYAxis);
  circlesClearGroup = updateToolTipActions(newToolTip, circlesClearGroup);
  //labelsGroup = updateToolTipActions(newToolTip, labelsGroup);

  // Setup x-Axis Label Event Listeners
  // ================================
  Object.entries(xLabelElements).forEach(([key, element]) => {

    element.on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value != chosenXAxis) {

        // placeholder for old selection so we can update bold styling later
        var oldChosenXAxis = chosenXAxis;

        // replace chosenXAxis with value
        chosenXAxis = value;

        // Debug
        console.log(`New x-axis selection: ${chosenXAxis}`);

        // update x scale for new data
        xLinearScale = xScale(stateData, chosenXAxis);

        // update x axis with transition
        bottomAxis = renderAxesX(xLinearScale, xAxis);

        // update circles with new x values
        circlesGroup = moveElements(circlesGroup, "cx", xLinearScale, chosenXAxis);

        // update data labels with new x values
        labelsGroup = moveElements(labelsGroup, "x", xLinearScale, chosenXAxis);

        // update clear circles with new x values
        circlesClearGroup = moveElements(circlesClearGroup, "cx", xLinearScale, chosenXAxis);

        // Update tool tip for chosen axes
        var newToolTip = updateToolTip(chosenXAxis, chosenYAxis);
        circlesClearGroup = updateToolTipActions(newToolTip, circlesClearGroup);
        //labelsGroup = updateToolTipActions(newToolTip, labelsGroup);

        // remove bold styling of old selection
        xLabelElements[oldChosenXAxis].classed("inactive", true).classed("active", false);

        // set bold styling of new selection
        xLabelElements[chosenXAxis].classed("inactive", false).classed("active", true);
      }
    });
  });

  // Setup y-Axis Label Event Listeners
  // ================================
  Object.entries(yLabelElements).forEach(([key, element]) => {

    element.on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value != chosenYAxis) {

        // placeholder for old selection so we can update bold styling later
        var oldChosenYAxis = chosenYAxis;

        // replace chosenYAxis with value
        chosenYAxis = value;

        // Debug
        console.log(`New y-axis selection: ${chosenYAxis}`);

        // update y scale for new data
        yLinearScale = yScale(stateData, chosenYAxis);

        // update y axis with transition
        leftAxis = renderAxesY(yLinearScale, yAxis);

        // update circles with new y values
        circlesGroup = moveElements(circlesGroup, "cy", yLinearScale, chosenYAxis);

        // update data labels with new y values
        labelsGroup = moveElements(labelsGroup, "y", yLinearScale, chosenYAxis);

        // update clear circles with new x values
        circlesClearGroup = moveElements(circlesClearGroup, "cy", yLinearScale, chosenYAxis);

        // Update tool tip for chosen axes
        var newToolTip = updateToolTip(chosenXAxis, chosenYAxis);
        circlesClearGroup = updateToolTipActions(newToolTip, circlesClearGroup);
       // labelsGroup = updateToolTipActions(newToolTip, labelsGroup);

        // remove bold styling of old selection
        yLabelElements[oldChosenYAxis].classed("inactive", true).classed("active", false);

        // set bold styling of new selection
        yLabelElements[chosenYAxis].classed("inactive", false).classed("active", true);
      }
    });
  });
}).catch(function(error) {
  console.log(error);
});
//======================================
//======= End MAIN EXECUTION ===========
//======================================