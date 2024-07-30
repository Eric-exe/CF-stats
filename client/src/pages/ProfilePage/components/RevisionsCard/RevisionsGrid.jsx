import { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import ProblemLinkRenderer from "../../../../components/ProblemLinkRenderer";
import API from "../../../../api";
import propTypes from "prop-types";

RevisionsGrid.propTypes = {
    problemStatuses: propTypes.array.isRequired,
    JWT: propTypes.string.isRequired,
    JWTSetter: propTypes.func.isRequired,
};

function RevisionsGrid(props) {
    const [rowData, setRowData] = useState([]);

    useEffect(() => {
        setRowData(
            props.problemStatuses.map((problemStatus) => ({
                problemId: problemStatus.problem.id,
                contestId: problemStatus.problem.contestId,
                index: problemStatus.problem.index,
                name: problemStatus.problem.name,
                lastAttempted: new Date(problemStatus.lastAttempted).toLocaleString(),
                markedToRevise: false,
                AC: problemStatus.AC,
            }))
        );
    }, [props.problemStatuses]);

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
        <div className="ag-theme-alpine" style={{ height: "35vh", width: "100%" }}>
            <AgGridReact columnDefs={columnDefs} rowData={rowData} />
        </div>
    );
}

export default RevisionsGrid;
