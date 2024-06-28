function QuestionStatsCard() {
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
                                <div>Problems attempted:&nbsp;{-1}</div>
                                <div>Problems solved:&nbsp;{-1}</div>
                                <div>Submissions:&nbsp;{-1}&nbsp;({-1}%)</div>
                                <hr />
                                Most common topics:
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

export default QuestionStatsCard;
