import { useState, useEffect } from "react";
import { AgCharts } from "ag-charts-react";
import propTypes from "prop-types";

RatingsBarChart.propTypes = {
    attempted: propTypes.object.isRequired,
    AC: propTypes.object.isRequired,
};

const CF_MIN_RATING = 800;
const CF_MAX_RATING = 3500;

function RatingsBarChart(props) {
    const [barData, setBarData] = useState({});
    const [barOptions, setBarOptions] = useState({});

    useEffect(() => {
        let newBarData = [];
        for (let rating = CF_MIN_RATING; rating <= CF_MAX_RATING; rating += 100) {
            const AC = props.AC[rating] || 0;
            const failed = (props.attempted[rating] || 0) - AC;
            newBarData.push({ rating, AC, failed });
        }
        setBarData(newBarData);
    }, [props.attempted, props.AC]);

    useEffect(() => {
        setBarOptions({
            data: barData,
            series: [
                {
                    type: "bar",
                    xKey: "rating",
                    yKey: "AC",
                    yName: "AC",
                    stacked: true,
                },
                {
                    type: "bar",
                    xKey: "rating",
                    yKey: "failed",
                    yName: "Failed",
                    stacked: true,
                },
            ],
        });
    }, [barData]);

    return <AgCharts options={barOptions} />;
}

export default RatingsBarChart;
