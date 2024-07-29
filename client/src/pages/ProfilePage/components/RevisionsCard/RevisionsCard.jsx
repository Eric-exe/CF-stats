import { useState, useEffect } from "react";
import UnsolvedGrid from "./UnsolvedGrid";
import propTypes from "prop-types";

RevisionsCard.propTypes = {
    userInfo: propTypes.object.isRequired,
};

function RevisionsCard(props) {
    const [unsolvedProblemStatuses, setUnsolvedProblemStatuses] = useState([]);

    useEffect(() => {
        if (props.userInfo.problemStatuses === null || props.userInfo.problemStatuses === undefined) {
            return;
        }
        setUnsolvedProblemStatuses(props.userInfo.problemStatuses.filter((status) => status.AC === 0));
    }, [props.userInfo]);

    return (
        <div className="card shadow m-4">
            <div className="card-header" data-bs-toggle="collapse" data-bs-target="#revisions-body" role="button">
                <b>Revisions</b>
            </div>
            <div className="collapse show" id="revisions-body">
                <div className="container-fluid">
                    <div className="container-fluid mt-3">
                        <UnsolvedGrid problemStatus={unsolvedProblemStatuses} />
                        <hr />
                        Problems that you marked as revise:
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RevisionsCard;
