import propTypes from "prop-types";
import StatsDisplay from "./StatsDisplay";

GraphStatsCard.propTypes = {
    title: propTypes.string.isRequired,
    id: propTypes.string.isRequired,
    activityArray: propTypes.array.isRequired,
};

function GraphStatsCard(props) {
    const arraySum = (array) => array.reduce((acc, x) => acc + x, 0);

    // guard to check empty array as that is the default in schema
    let activityArray = props.activityArray;
    if (activityArray.length === 0) {
        activityArray = Array(60).fill(0);
    }

    const daily = activityArray[0];
    const prevDaily = activityArray[1];
    const weekly = arraySum(activityArray.slice(0, 7));
    const prevWeekly = arraySum(activityArray.slice(7, 14));
    const monthly = arraySum(activityArray.slice(0, 30));
    const prevMonthly = arraySum(activityArray.slice(30, 60));

    return (
        <div className="card shadow">
            <div className="card-header" data-bs-toggle="collapse" data-bs-target={`#${props.id}`} role="button">
                <b>{props.title}</b>
            </div>

            <div className="collapse show" id={props.id}>
                <div className="container-fluid">
                    <div className="card-body">
                        <div className="row">
                            <StatsDisplay timeFrame="Daily" current={daily} previous={prevDaily}/>
                            <StatsDisplay timeFrame="Weekly" current={weekly} previous={prevWeekly}/>
                            <StatsDisplay timeFrame="Monthly" current={monthly} previous={prevMonthly}/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GraphStatsCard;
