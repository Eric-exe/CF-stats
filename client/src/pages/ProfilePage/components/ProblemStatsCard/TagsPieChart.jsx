import { useState, useEffect } from "react";
import { AgCharts } from "ag-charts-react";
import propTypes from "prop-types";

TagsPieChart.propTypes = {
    data: propTypes.object.isRequired,
};

// this order must be maintained for the multiple pie charts to have the same color for each tag
// This is because AG Grid doesn't allow assigning colors to keys directly but to the order.
const TAGS_ORDER = [
    "math",
    "greedy",
    "implementation",
    "dp",
    "constructive algorithms",
    "data structures",
    "brute force",
    "sortings",
    "graphs",
    "binary search",
    "dfs and similar",
    "trees",
    "number theory",
    "strings",
    "combinatorics",
    "bitmasks",
    "two pointers",
    "*special",
    "geometry",
    "dsu",
    "divide and conquer",
    "shortest paths",
    "probabilities",
    "interactive",
    "games",
    "hashing",
    "flows",
    "matrices",
    "fft",
    "string suffix structures",
    "graph matchings",
    "ternary search",
    "expression parsing",
    "2-sat",
    "chinese remainder theorem",
    "schedules",
];

const COLORS = [
    "#ff4500",
    "#00ced1",
    "#ff8c00",
    "#ffff00",
    "#7fff00",
    "#00fa92",
    "#8a2be2",
    "#f4a460",
    "#0000ff",
    "#ff00ff",
    "#1e90ff",
    "#db7093",
    "#f0e68c",
    "#fa8072",
    "#dda0dd",
    "#b0e0e6",
    "#ff1493",
    "#7b68ee",
    "#ee82ee",
    "#7fffd4",
    "#ffc0cb",
    "#808080",
    "#556b2f",
    "#8b4513",
    "#808000",
    "#483d8b",
    "#b22222",
    "#008000",
    "#008080",
    "#4682b4",
    "#000080",
    "#9acd32",
    "#32cd32",
    "#8fbc8f",
    "#8b008b",
    "#d2b48c"
];

function TagsPieChart(props) {
    const [chartData, setChartData] = useState([]);
    const [chartOptions, setChartOptions] = useState({});

    useEffect(() => {
        let newChartData = [];
        for (const tag of TAGS_ORDER) {
            if (Object.prototype.hasOwnProperty.call(props.data, tag)) {
                newChartData.push({ tag, count: props.data[tag] });
            } else {
                newChartData.push({ tag, count: 0 });
            }
        }
        setChartData(newChartData);
    }, []);

    useEffect(() => {
        setChartOptions({
            data: chartData,
            series: [
                {
                    type: "pie",
                    angleKey: "count",
                    legendItemKey: "tag",
                    fills: COLORS
                },
            ],
        });
    }, [chartData]);

    return <AgCharts options={chartOptions} />;
}

export default TagsPieChart;
