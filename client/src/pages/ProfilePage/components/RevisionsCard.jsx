import { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import propTypes from "prop-types";
import API from "../../../api";
import ProblemLinkRenderer from "../../../components/ProblemLinkRenderer";

RevisionsCard.propTypes = {
    userInfo: propTypes.object.isRequired,
    JWT: propTypes.string.isRequired,
    JWTSetter: propTypes.func.isRequired,
};

function RevisionsCard(props) {
    const [problemsToRevise, setProblemsToRevise] = useState([]);
    const [rowData, setRowData] = useState([]);

    useEffect(() => {
        if (props.userInfo.problemStatuses === null || props.userInfo.problemStatuses === undefined) {
            return;
        }
        setProblemsToRevise(props.userInfo.problemStatuses.filter((status) => status.AC === 0 || status.markedForRevision));
    }, [props.userInfo]);

    useEffect(() => {
        setRowData(
            problemsToRevise.map((problemStatus) => ({
                problemId: problemStatus.problem.id,
                contestId: problemStatus.problem.contestId,
                index: problemStatus.problem.index,
                name: problemStatus.problem.name,
                lastAttempted: new Date(problemStatus.lastAttempted).toLocaleString(),
                markedToRevise: false,
                AC: problemStatus.AC,
            }))
        );
    }, [problemsToRevise]);

    const RevisedButtonRenderer = (params) => {
        return (
            <div className="d-flex justify-content-center align-items-center h-100">
                {params.data.AC === 0 ? (
                    "Problem not solved"
                ) : (
                    <button
                        className="btn btn-sm btn-outline-dark"
                        onClick={() => {
                            API.markProblemForRevision(props.JWT, params.data.problemId, false);
                        }}
                    >
                        Remove
                    </button>
                )}
            </div>
        );
    };

    const columnDefs = [
        { field: "contestId", headerName: "Contest ID", sortable: true, filter: true },
        { field: "index", headerName: "Index", sortable: true, filter: true },
        { field: "name", headerName: "Problem Name", sortable: true, filter: true, cellRenderer: ProblemLinkRenderer, flex: 2 },
        { field: "lastAttempted", headerName: "Last Attempted", sortable: true, filter: true, flex: 1 },
        { field: "markedToRevise", headerName: "", cellRenderer: RevisedButtonRenderer, flex: 1 },
    ];

    return (
        <div className="card shadow m-4">
            <div className="card-header" data-bs-toggle="collapse" data-bs-target="#revisions-body" role="button">
                <b>Revisions</b>
            </div>
            <div className="collapse show" id="revisions-body">
                <div className="container-fluid">
                    <div className="card-body">
                        <div className="ag-theme-alpine" style={{ height: "35vh", width: "100%" }}>
                            <AgGridReact columnDefs={columnDefs} rowData={rowData} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RevisionsCard;
