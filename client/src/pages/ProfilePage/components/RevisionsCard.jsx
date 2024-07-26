import { AgGridReact } from "ag-grid-react";
import propTypes from "prop-types";
import ProblemLinkRenderer from "../../../components/ProblemLinkRenderer";

RevisionsCard.propTypes = {
    userInfo: propTypes.object.isRequired,
};

function RevisionsCard(props) {
    const columnDefs = [
        { field: "contestId", headerName: "Contest ID", sortable: true, filter: true },
        { field: "index", headerName: "Index", sortable: true, filter: true },
        { field: "name", headerName: "Problem Name", sortable: true, filter: true, cellRenderer: ProblemLinkRenderer, flex: 1 },
    ];

    return (
        <div className="card shadow m-4">
            <div className="card-header" data-bs-toggle="collapse" data-bs-target="#revisions-body" role="button">
                <b>Revisions</b>
            </div>
            <div className="collapse show" id="revisions-body">
                <div className="container-fluid">
                    <div className="container-fluid mt-3">
                        These are the problems that you have failed to solve:
                        <div className="ag-theme-alpine my-3" style={{ height: "45vh", width: "100%" }}>
                            <AgGridReact columnDefs={columnDefs} rowData={props.userInfo.unsolvedProblems} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RevisionsCard;
