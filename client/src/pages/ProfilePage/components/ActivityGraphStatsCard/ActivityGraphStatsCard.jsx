import { useState, useEffect } from "react";
import { AgCharts } from "ag-charts-react";
import propTypes from "prop-types";
import StatsDisplay from "./StatsDisplay";

GraphStatsCard.propTypes = {
    title: propTypes.string.isRequired,
    id: propTypes.string.isRequired,
    activityArray: propTypes.array.isRequired,
};

function GraphStatsCard(props) {
    const arraySum = (array) => array.reduce((acc, x) => acc + x, 0);

    const [daily, setDaily] = useState(-1);
    const [prevDaily, setPrevDaily] = useState(-1);
    const [weekly, setWeekly] = useState(-1);
    const [prevWeekly, setPrevWeekly] = useState(-1);
    const [monthly, setMonthly] = useState(-1);
    const [prevMonthly, setPrevMonthly] = useState(-1);
    const [chartData, setChartData] = useState([]);

    const [chartOptions, setChartOptions] = useState({});

    useEffect(() => {
        // guard to check empty array as that is the default in schema
        let activityArray = props.activityArray;
        if (activityArray.length === 0) {
            activityArray = Array(60).fill(0);
        }

        setDaily(activityArray[0]);
        setPrevDaily(activityArray[1]);
        setWeekly(arraySum(activityArray.slice(0, 7)));
        setPrevWeekly(arraySum(activityArray.slice(7, 14)));
        setMonthly(arraySum(activityArray.slice(0, 30)));
        setPrevMonthly(arraySum(activityArray.slice(30, 60)));

        let data = props.activityArray.map((activity, index) => {
            // gets the date of activity element. 
            // 0th element is today, 1st element is yesterday, etc...
            let date = new Date();
            date.setDate(date.getDate() - index);
            return {
                date: date.toLocaleDateString(),
                activity
            };
        });

        setChartData(data.reverse());
    }, [props.activityArray]);


    useEffect(() => {
        setChartOptions({
            data: chartData,
            series: [
                {
                    type: "line",
                    xKey: "date",
                    xName: "Day",
                    yKey: "activity",
                    yName: "Activity",
                    interpolation: { type: "smooth" },
                },
            ],
        });
    }, [chartData]);

    return (
        <div className="card shadow">
            <div className="card-header" data-bs-toggle="collapse" data-bs-target={`#${props.id}`} role="button">
                <b>{props.title}</b>
            </div>

            <div className="collapse show" id={props.id}>
                <div className="container-fluid">
                    <div className="card-body">
                        <div className="row">
                            <StatsDisplay timeFrame="Daily" current={daily} previous={prevDaily} />
                            <StatsDisplay timeFrame="Weekly" current={weekly} previous={prevWeekly} />
                            <StatsDisplay timeFrame="Monthly" current={monthly} previous={prevMonthly} />
                        </div>

                        <AgCharts options={chartOptions} className="chart" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GraphStatsCard;
