import propTypes from "prop-types";

GraphStatsCard.propTypes = {
    title: propTypes.string.isRequired,
    id: propTypes.string.isRequired,
}

function GraphStatsCard(props) {
    return (
        <div className="card shadow">
            <div className="card-header" data-bs-toggle="collapse" data-bs-target={`#${props.id}`} role="button">
                <b>{props.title}</b>
            </div>

            <div className="collapse show" id={props.id}>
                <div className="container-fluid">
                    <div className="card-body">
                        <div className="row">
                            <div className="col-xl-4 d-flex">
                                Daily:&nbsp;{-1}&nbsp;(
                                <div className="text-success">+100%</div>
                                )
                            </div>
                            <div className="col-xl-4 d-flex">
                                Weekly:&nbsp;{-1}&nbsp;(
                                <div className="text-success">+100%</div>
                                )
                            </div>
                            <div className="col-xl-4 d-flex">
                                Monthly:&nbsp;{-1}&nbsp;(
                                <div className="text-danger">-100%</div>
                                )
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GraphStatsCard;