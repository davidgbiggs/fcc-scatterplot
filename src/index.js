import "./styles.scss";
import * as d3 from "d3";

const width = 1000;
const height = 500;
const padding = 60;

function generateTooltipHtml({ Name, Nationality, Time, Year, Doping }) {
  const baseHTML = `<div>${Name}: ${Nationality}</div><div>Year: ${Year}, Time: ${Time}</div>`;
  return Doping ? baseHTML + `<br /><div>${Doping}</div>` : baseHTML;
}

function convertToMillis(str) {
  const minSec = str.split(":");
  const minsToMillis = 60 * 1000 * minSec[0];
  const secsToMillis = 1000 * minSec[1];
  return minsToMillis + secsToMillis;
}

fetch(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json"
)
  .then((res) => {
    return res.json();
  })
  .then((response) => {
    const dataSet = response;
    console.log(response);

    const xScale = d3
      .scaleTime()
      .domain([
        d3.min(dataSet, (d) => new Date(d.Year, 0, 0, 0, 0, 0)),
        d3.max(dataSet, (d) => new Date(d.Year, 0, 0, 0, 0, 0)),
      ])
      .range([padding, width - padding]);

    const yScale = d3
      .scaleTime()
      .domain([
        d3.max(dataSet, (d) => new Date(convertToMillis(d.Time))),
        d3.min(dataSet, (d) => new Date(convertToMillis(d.Time))),
      ])
      .range([height - padding, padding]);

    const yAxis = d3.axisLeft(yScale).tickFormat((d) => {
      const formattedTime = `${d.getMinutes()}:${d.getSeconds()}`;
      if (d.getSeconds() < 1) {
        return formattedTime + "0";
      } else {
        return formattedTime;
      }
    });
    const xAxis = d3.axisBottom(xScale);

    console.log(new Date(convertToMillis("37:00") - new Date(0)));

    const svg = d3
      .select("#svg-container")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("id", "tooltip")
      .style("opacity", 0);

    d3.select("body")
      .append("div")
      .attr("id", "legend")
      .attr("x", "40")
      .attr("y", "40")
      .html(
        "<div class='legend-div'>Doping Allegations&nbsp;<div class='doping legend-icon'>&nbsp;</div></div><div class='legend-div'>No Doping Allegations&nbsp;<div class='no-doping legend-icon'></div></div>"
      );

    svg
      .selectAll("circle")
      .data(dataSet)
      .enter()
      .append("circle")
      .attr("cy", (d) => {
        return yScale(new Date(convertToMillis(d.Time)));
      })
      .attr("cx", (d) => xScale(new Date(d.Year, 0, 0, 0, 0, 0)))
      .attr("r", "7.5px")
      .attr("data-xvalue", (d) => new Date(d.Year, 0, 0, 0, 0, 0))
      .attr("data-yvalue", (d) => new Date(convertToMillis(d.Time)))
      .attr("class", (d) => (d.Doping ? "doping dot" : "no-doping dot"))
      .on("mouseover", (e, d) => {
        d3.select(this).transition().duration("50").attr("opacity", ".85");
        tooltip
          .html(generateTooltipHtml(d))
          .style("left", `${e.screenX}px`)
          .style("top", `${e.screenY - 100}px`)
          .attr("data-year", new Date(d.Year, 0, 0, 0, 0, 0));
        tooltip.transition().duration(50).style("opacity", 1);
      })
      .on("mouseout", function () {
        d3.select(this).transition().duration("50").attr("opacity", "1");
        // Makes the tooltip disappear:
        tooltip.transition().duration("50").style("opacity", 0);
      })
      .html("<div>No Doping Allegations</div><div>Doping Allegations</div>");

    svg
      .append("g")
      .attr("transform", `translate(${padding}, 0)`)
      .attr("id", "y-axis")
      .call(yAxis);

    svg
      .append("g")
      .attr("transform", `translate(0, ${height - padding})`)
      .attr("id", "x-axis")
      .call(xAxis);
  });
