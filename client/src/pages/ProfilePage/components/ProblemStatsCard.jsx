import propTypes from "prop-types";

ProblemStatsCard.propTypes = {
    profileInfo: propTypes.object.isRequired, 
}

function ProblemStatsCard(props) {
    // handle common tags
    const tags = Object.keys(props.profileInfo.problemTags);
    tags.sort((a, b) => props.profileInfo.problemTags[b] - props.profileInfo.problemTags[a]);

    return (
        <div className="card shadow m-4">
            <div className="card-header" data-bs-toggle="collapse" data-bs-target="#problem-stats-body" role="button">
                <b>Problem Stats</b>
            </div>
            <div className="collapse show" id="problem-stats-body">
                <div className="container-fluid">
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-4">
                                <div>Problems attempted:&nbsp;{props.profileInfo.problems.length}</div>
                                <div>Problems AC:&nbsp;{props.profileInfo.problemsAC}</div>
                                <div>Submissions (AC/total):&nbsp;
                                    {props.profileInfo.totalAC + "/" + props.profileInfo.totalSubmissions}
                                    &nbsp;({Math.round(props.profileInfo.totalAC / props.profileInfo.totalSubmissions * 100 * 100) / 100}%)
                                </div>
                                <hr />
                                Most common topics practiced:
                                {(() => {
                                    const rows = [];
                                    for (let i = 0; i < Math.min(tags.length, 5); i++) {
                                        rows.push(
                                            <div key={i} className="row">
                                                <div className="col-6 text-truncate">{tags[i]}:&nbsp;{props.profileInfo.problemTags[tags[i]]}</div>
                                                <div className="col-6 text-truncate">{i + 5 < tags.length ? tags[i + 5] + ": " + String(props.profileInfo.problemTags[tags[i + 5]]) : ""}</div>
                                            </div>
                                        );
                                    }

                                    return rows;
                                })()}
                            </div>

                            <div className="col-md-4">Your Problems:</div>

                            <div className="col-md-4">Problems in your Elo Range:</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProblemStatsCard;
