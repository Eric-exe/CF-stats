import SuggestedProblem from "./SuggestedProblem";
import RecentProblemsRater from "./RecentProblemsRater";
import propTypes from "prop-types";

SuggestedProblemCard.propTypes = {
    userInfo: propTypes.object.isRequired,
    JWT: propTypes.string.isRequired,
    JWTSetter: propTypes.func.isRequired,
};

function SuggestedProblemCard(props) {
    return (
        <div className="card shadow m-4">
            <div className="card-header" data-bs-toggle="collapse" data-bs-target="#suggested-problem-body" role="button">
                <b>Suggested Problem</b>
            </div>
            <div className="collapse show" id="suggested-problem-body">
                <div className="container-fluid">
                    <div className="card-body">
                        <SuggestedProblem
                            userInfo={props.userInfo}
                            JWT={props.JWT}
                            JWTSetter={props.JWTSetter}
                        />

                        <RecentProblemsRater
                            userInfo={props.userInfo}
                            JWT={props.JWT}
                            JWTSetter={props.JWTSetter}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SuggestedProblemCard;
