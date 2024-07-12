import propTypes from "prop-types";

StatsDisplay.propTypes = {
    timeFrame: propTypes.string.isRequired,
    current: propTypes.number.isRequired,
    previous: propTypes.number.isRequired, 
}

function StatsDisplay(props) {
    return (
        <div className="col-xl-4 d-flex flex-wrap">
            {props.timeFrame}:&nbsp;
            <div className="d-flex text-nowrap">
                {props.current}&nbsp;(
                <div className={props.current >= props.previous ? "text-success" : "text-danger"}>
                    <i className={"bi " + (props.current >= props.previous ? "bi-caret-up-fill" : "bi-caret-down-fill")}></i>
                    {Math.abs(Math.round(((props.current - props.previous) / Math.max(1, props.previous)) * 100 * 100) / 100)}%
                </div>
                )
            </div>
        </div>
    );
}

export default StatsDisplay;
