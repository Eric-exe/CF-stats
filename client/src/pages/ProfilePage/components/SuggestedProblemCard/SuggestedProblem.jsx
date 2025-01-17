import { useState } from "react";
import Filter from "../../../../components/Filter";
import API from "../../../../api";
import propTypes from "prop-types";

SuggestedProblem.propTypes = {
    userInfo: propTypes.object.isRequired,
    JWT: propTypes.string.isRequired,
    JWTSetter: propTypes.func.isRequired,
};

function SuggestedProblem(props) {
    const [ratingStart, setRatingStart] = useState("");
    const [ratingEnd, setRatingEnd] = useState("");
    const [tags, setTags] = useState([]);

    const handleChangeProblemClick = async () => {
        const data = API.generatedSuggestedProblem(
            props.JWT,
            ratingStart === "" ? -1 : ratingStart,
            ratingEnd === "" ? -1 : ratingEnd,
            tags
        ).then((response) => response.json());

        if (Object.prototype.hasOwnProperty.call(data, "JWT Error")) {
            props.JWTSetter("");
        }
    };

    return (
        <div className="card mb-3">
            <div className="card-body">
                <div className="row">
                    <div className="col-6">
                        <div>
                            <div className="d-flex align-items-center">
                                <div className="text-nowrap">Rating:&nbsp;</div>
                                <div>
                                    <input
                                        className="form-control"
                                        type="number"
                                        value={ratingStart}
                                        onChange={(event) => setRatingStart(event.target.value)}
                                    />
                                </div>
                                <div className="text-nowrap">&nbsp;-&nbsp;</div>
                                <div>
                                    <input
                                        className="form-control"
                                        type="number"
                                        value={ratingEnd}
                                        onChange={(event) => setRatingEnd(event.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-6">
                        <Filter tagsSetter={setTags} />
                    </div>
                </div>
                <div className="mt-2">
                    Note: By default, you will be suggested slightly harder problems than your current estimated rating.
                </div>
                <hr />
                <div className="container-fluid d-flex align-items-center overflow-auto mt-3">
                    <div className="me-4">Current Problem:</div>
                    <div className="row align-items-center flex-grow-1 flex-nowrap">
                        {props.userInfo && props.userInfo.assignedProblem !== undefined && props.userInfo.assignedProblem !== null ? (
                            <>
                                <div className="col-1 text-truncate">{props.userInfo.assignedProblem.contestId}</div>
                                <div className="col-1 text-truncate">{props.userInfo.assignedProblem.index}</div>
                                <div className="col-8 text-truncate">
                                    <a
                                        href={`https://codeforces.com/contest/${props.userInfo.assignedProblem.contestId}/problem/${props.userInfo.assignedProblem.index}`}
                                        target="_blank"
                                    >
                                        {props.userInfo.assignedProblem.name}
                                    </a>
                                </div>
                            </>
                        ) : (
                            <div className="col-10">No problem found.</div>
                        )}
                        <div className="col-2 d-flex justify-content-end">
                            <button className="btn btn-sm btn-outline-dark" onClick={handleChangeProblemClick}>
                                New Problem
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SuggestedProblem;
