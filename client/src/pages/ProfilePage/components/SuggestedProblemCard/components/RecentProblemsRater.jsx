import "./RecentProblemsRater.css";
import propTypes from "prop-types";

RecentProblemsRater.propTypes = {
    problemStatuses: propTypes.array.isRequired,
};

function RecentProblemsRater(props) {
    return (
        <div>
            <div className="accordion" id="recent-problems-accordion">
                <div className="accordion-item">
                    <h2 className="accordion-header">
                        <button
                            id="problems-rater-button"
                            className="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#recent-problems-rater"
                        >
                            Recent Problems Difficulty Rater
                        </button>
                    </h2>
                    <div id="recent-problems-rater" className="accordion-collapse collapse" data-bs-parent="#recent-problems-accordion">
                        <div className="accordion-body">
                            Rate the difficulty of the problems you recently attempted for better suggested problems!
                            <div className="table-responsive" style={{ maxHeight: "45vh" }}>
                                <table className="table table-striped mt-3">
                                    <thead>
                                        <tr>
                                            <th scope="col text" className="text-truncate">
                                                Contest ID
                                            </th>
                                            <th scope="col">Index</th>
                                            <th scope="col">Problem</th>
                                            <th scope="col">Rating</th>
                                            <th scope="col">Topics</th>
                                            <th scope="col">AC/Attempted</th>
                                            <th scope="col">Difficulty</th>
                                        </tr>
                                    </thead>

                                    <tbody className="table-group-divider" style={{ maxHeight: "45vh" }}>
                                        {props.problemStatuses.map((problemStatus, index) => (
                                            <tr key={index}>
                                                <td>{problemStatus.problem.contestId}</td>
                                                <td>{problemStatus.problem.index}</td>
                                                <td>
                                                    <a
                                                        href={`https://codeforces.com/contest/${problemStatus.problem.contestId}/problem/${problemStatus.problem.index}`}
                                                    >
                                                        {problemStatus.problem.name}
                                                    </a>
                                                </td>
                                                <td>{problemStatus.problem.rating}</td>
                                                <td>
                                                    <div>
                                                        {problemStatus.problem.tags.map((tag, index) => (
                                                            <div key={index} className="badge rounded-pill bg-secondary me-1">
                                                                {tag}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="text-truncate">
                                                    {problemStatus.AC}/{problemStatus.submissions} (
                                                    {Math.round((problemStatus.AC / problemStatus.submissions) * 100 * 100) / 100}%)
                                                </td>

                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <input
                                                            type="range"
                                                            className="form-range rating-slider"
                                                            min="1"
                                                            max="5"
                                                            step="1"
                                                            id="range"
                                                            defaultValue="3"
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RecentProblemsRater;
