import propTypes from "prop-types";

SubmissionsStatsCard.propTypes = {
    profileInfo: propTypes.object.isRequired,
};

function SubmissionsStatsCard(props) {
    return (
        <div className="card shadow m-4">
            <div className="card-header" data-bs-toggle="collapse" data-bs-target="#submissions-stats-body" role="button">
                <b>Recent Submissions</b>
            </div>
            <div className="collapse show" id="submissions-stats-body">
                <div className="container-fluid">
                    <div className="card-body">
                        <div className="table-responsive" style={{maxHeight: "45vh"}}>
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th scope="col">Submission ID</th>
                                        <th scope="col">Problem</th>
                                        <th scope="col">Status</th>
                                        <th scope="col">Submission Time</th>
                                        <th scope="col">Programming Language</th>
                                        <th scope="col">Time (ms)</th>
                                        <th scope="col">Memory (kb)</th>
                                    </tr>
                                </thead>

                                <tbody className="table-group-divider">
                                    {props.profileInfo.submissions.slice(0, 1000).map((submission, index) => (
                                        <tr key={index}>
                                            <td>
                                                <a
                                                    href={`https://codeforces.com/contest/${submission.problem.contestId}/submission/${submission.id}`}
                                                >
                                                    {submission.id}
                                                </a>
                                            </td>
                                            <td>
                                                <a
                                                    href={`https://codeforces.com/contest/${submission.problem.contestId}/problem/${submission.problem.index}`}
                                                >
                                                    {submission.problem.name}
                                                </a>
                                            </td>
                                            <td>{submission.verdict}</td>
                                            <td>{new Date(submission.timeCreated).toLocaleString()}</td>
                                            <td>{submission.programmingLang}</td>
                                            <td>{submission.timeUsed}</td>
                                            <td>{submission.memoryUsed / 1000}</td>
                                        </tr>
                                    ))}
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
