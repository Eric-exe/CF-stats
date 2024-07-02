import propTypes from "prop-types";

GraphStatsCard.propTypes = {
    title: propTypes.string.isRequired,
    id: propTypes.string.isRequired,
    activityArray: propTypes.array.isRequired,
};

function GraphStatsCard(props) {
    const arraySum = (array) => {
        let res = 0;
        for (const x of array) {
            res += x;
        }
        return res;
    };

    const daily = props.activityArray[0];
    const prevDaily = props.activityArray[1];
    const weekly = arraySum(props.activityArray.slice(0, 7));
    const prevWeekly = arraySum(props.activityArray.slice(7, 14));
    const monthly = arraySum(props.activityArray.slice(0, 30));
    const prevMonthly = arraySum(props.activityArray.slice(30, 60));

    console.log(props.activityArray);

    return (
        <div className="card shadow">
            <div className="card-header" data-bs-toggle="collapse" data-bs-target={`#${props.id}`} role="button">
                <b>{props.title}</b>
            </div>

            <div className="collapse show" id={props.id}>
                <div className="container-fluid">
                    <div className="card-body">
                        <div className="row">
                            <div className="col-xl-4 d-flex flex-wrap">
                                Daily:&nbsp;
                                <div className="d-flex text-nowrap">
                                    {daily}&nbsp;(
                                    <div className={daily >= prevDaily ? "text-success" : "text-danger"}>
                                        <i className={"bi " + (daily >= prevDaily ? "bi-caret-up-fill" : "bi-caret-down-fill")}></i>
                                        {Math.abs(Math.round(((daily - prevDaily) / Math.max(1, prevDaily)) * 100 * 100) / 100)}%
                                    </div>
                                    )
                                </div>
                            </div>
                            <div className="col-xl-4 d-flex flex-wrap">
                                Weekly:&nbsp;
                                <div className="d-flex text-nowrap">
                                    {weekly}&nbsp;(
                                    <div className={weekly >= prevWeekly ? "text-success" : "text-danger"}>
                                        <i className={"bi " + (weekly >= prevWeekly ? "bi-caret-up-fill" : "bi-caret-down-fill")}></i>
                                        {Math.abs(Math.round(((weekly - prevWeekly) / Math.max(1, prevWeekly)) * 100 * 100) / 100)}%
                                    </div>
                                    )
                                </div>
                            </div>
                            <div className="col-xl-4 d-flex flex-wrap">
                                Monthly:&nbsp;
                                <div className="d-flex text-nowrap">
                                    {monthly}&nbsp;(
                                    <div className={monthly >= prevMonthly ? "text-success" : "text-danger"}>
                                        <i className={"bi " + (monthly >= prevMonthly ? "bi-caret-up-fill" : "bi-caret-down-fill")}></i>
                                        {Math.abs(Math.round(((monthly - prevMonthly) / Math.max(1, prevMonthly)) * 100 * 100) / 100)}%
                                    </div>
                                    )
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GraphStatsCard;
