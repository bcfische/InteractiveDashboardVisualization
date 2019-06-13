function buildMetadata(sample) {
  // Grab reference to metadata panel element and clear existing text
  var panel = d3.select("#sample-metadata");
  panel.html("");

  // Fetch sample metadata and display on panel
  d3.json("/metadata/"+`${sample}`)
    .then(function(data) {
      for (let [key, value] of Object.entries(data)) {
        panel.append("h5").text(`${key}: ${value}`);
      }
    });
}

function buildCharts(sample) {
  // Fetch sample data
  d3.json("/samples/"+`${sample}`)
    .then(function(data) {

      // Build bubble chart
      var traceB = {
        type: "scatter",
        mode: "markers",
        x: data.otu_ids,
        y: data.sample_values,
        hovertext: data.otu_labels,
        marker: {
          size: data.sample_values,
          color: data.otu_ids,
          colorscale: "Viridis",
          sizemode: "area",
          sizeref: 0.1
        }
      };
      var layoutB = {
        xaxis: {
          title: "operational taxonomic unit (otu) id"
        },
        yaxis: {
          title: "abundance"
        }
      };
      Plotly.newPlot("bubble", [traceB], layoutB);

      // Build pie chart
      var pdata = [];
      for (var i=0; i<data.sample_values.length; i++) {
        pdata.push({ids:data.otu_ids[i],
                    labels:data.otu_labels[i],
                    values:data.sample_values[i]
                  });
      }
      // Sort descending and take top 10 values
      pdata.sort((a,b) => b.values-a.values);
      var psliced = pdata.slice(0,10);
      var traceP = {
        type: "pie",
        values: psliced.map(d => d.values),
        labels: psliced.map(d => d.ids),
        hovertext: psliced.map(d => d.labels)
      };
      Plotly.newPlot("pie", [traceP], {'title' : 'Top 10 Species'});
    });
}

function init() {
  // Grab reference to dropdown select element
  var selector = d3.select("#selDataset");

  // Use list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use first sample from list to build initial plots
    const firstSample = sampleNames[0];
    console.log("First Sample: ",firstSample);
    buildMetadata(firstSample);
    buildCharts(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  console.log("New Sample: ",newSample);
  buildMetadata(newSample);
  buildCharts(newSample);
}

// Initialize the dashboard
init();
