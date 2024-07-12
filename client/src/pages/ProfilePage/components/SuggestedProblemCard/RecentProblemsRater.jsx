import "./RecentProblemsRater.css";
import API from "../../../../api";
import propTypes from "prop-types";

RecentProblemsRater.propTypes = {
    userInfo: propTypes.object.isRequired,
    JWT: propTypes.string.isRequired,
    JWTSetter: propTypes.func.isRequired,
};

function RecentProblemsRater(props) {
    const handleRatingChange = async (event, problemId) => {
        try {
            const data = await API.updateDifficultyRating(props.JWT, problemId, event.target.value).then(response => response.json());
            if (Object.prototype.hasOwnProperty.call(data, "JWT Error")) {
                props.JWTSetter("");
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <div className="accordion" id="recent-problems-accordion">
                <div className="accordion-item">
                    <h2 className="accordion-header">
                        <button
                            id="problems-rater-button"
                            className="accordion-button collapsed overflow-auto"
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
                            <br />
                            <b>1 = easy, 5 = difficult</b>
                            <br />
                            <br />
                            Recommended to come back and rate the problem after you AC or give up!
                            <br />
                            Note: Problems you haven&apos;t rated are rated based on # of submissions before first AC.
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
                                        {props.userInfo.problemStatuses.slice(0,200).map((problemStatus, index) => (
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
                                                        1&nbsp;
                                                        <input
                                                            type="range"
                                                            className="form-range rating-slider"
                                                            min="1"
                                                            max="5"
                                                            step="1"
                                                            id="range"
                                                            defaultValue={problemStatus.userDifficultyRating}
                                                            onChange={(event) => handleRatingChange(event, problemStatus.problem.id)}
                                                        />
                                                        &nbsp;5
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
