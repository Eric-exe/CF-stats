import { useState, useEffect } from "react";
import UnsolvedGrid from "./RevisionsGrid";
import propTypes from "prop-types";
import RevisionsGrid from "./RevisionsGrid";

RevisionsCard.propTypes = {
    userInfo: propTypes.object.isRequired,
};

function RevisionsCard(props) {
    const [problemsToRevise, setProblemsToRevise] = useState([]);

    useEffect(() => {
        if (props.userInfo.problemStatuses === null || props.userInfo.problemStatuses === undefined) {
            return;
        }
        setProblemsToRevise(props.userInfo.problemStatuses.filter((status) => status.AC === 0 || status.markedForRevision));
    }, [props.userInfo]);

    return (
        <div className="card shadow m-4">
            <div className="card-header" data-bs-toggle="collapse" data-bs-target="#revisions-body" role="button">
                <b>Revisions</b>
            </div>
            <div className="collapse show" id="revisions-body">
                <div className="container-fluid">
                    <div className="card-body">
                        <RevisionsGrid problemStatuses={problemsToRevise} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RevisionsCard;
