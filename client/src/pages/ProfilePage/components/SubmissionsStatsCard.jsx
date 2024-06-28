function SubmissionsStatsCard() {
    return (
        <div className="card shadow m-4">
            <div className="card-header" data-bs-toggle="collapse" data-bs-target="#submissions-stats-body" role="button">
                <b>Recent Submissions</b>
            </div>
            <div className="collapse show" id="submissions-stats-body">
                <div className="container-fluid">
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th scope="col">Submission ID</th>
                                        <th scope="col">Problem</th>
                                        <th scope="col">Status</th>
                                        <th scope="col">Programming Language</th>
                                        <th scope="col">Time</th>
                                        <th scope="col">Memory</th>
                                    </tr>
                                </thead>

                                <tbody className="table-group-divider">
                                    <tr>
                                        <td>45</td>
                                        <td>we</td>
                                        <td>as</td>
                                        <td>as</td>
                                        <td>as</td>
                                        <td>as</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SubmissionsStatsCard;
