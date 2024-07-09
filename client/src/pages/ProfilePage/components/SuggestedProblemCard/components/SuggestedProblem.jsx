import API from "../../../../../api";
import propTypes from "prop-types";

SuggestedProblem.propTypes = {
    userInfo: propTypes.object.isRequired,
    userInfoSetter: propTypes.func.isRequired,
    JWT: propTypes.string.isRequired,
    JWTSetter: propTypes.func.isRequired, 
};

function SuggestedProblem(props) {
    const handleChangeProblemClick = async () => {
        const data = await API.generatedSuggestedProblem(props.JWT, -1, -1, []).then(response => response.json());
        if (Object.prototype.hasOwnProperty.call(data, "JWT Error")) {
            props.JWTSetter("");
        }
        else {
            props.userInfoSetter(data);
        }
    };

    return (
        <div className="card mb-3">
            <div className="card-body">
                <div className="d-flex align-items-center overflow-auto">
                    <div className="me-4">Current Problem:</div>
                    <div className="row align-items-center flex-grow-1 flex-nowrap">
                        {props.userInfo.assignedProblemId !== null ? (
                            <>
                                <div className="col-1 text-truncate">{props.userInfo.assignedProblem.contestId}</div>
                                <div className="col-1 text-truncate">{props.userInfo.assignedProblem.index}</div>
                                <div className="col-8 text-truncate">
                                    <a
                                        href={`https://codeforces.com/contest/${props.userInfo.assignedProblem.contestId}/problem/${props.userInfo.assignedProblem.index}`}
                                    >
                                        {props.userInfo.assignedProblem.name}
                                    </a>
                                </div>
                            </>
                        ) : (
                            <div className="col-10">No problem found. Remove some of the filters.</div>
                        )}
                        <div className="col-2 d-flex justify-content-end">
                            <button className="btn btn-sm btn-outline-dark" onClick={handleChangeProblemClick}>Change Problem</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SuggestedProblem;
