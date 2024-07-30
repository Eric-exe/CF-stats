import "./RecentProblemsRater.css";
import { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import ProblemLinkRenderer from "../../../../components/ProblemLinkRenderer";
import TagsRenderer from "../../../../components/TagsRenderer";
import API from "../../../../api";
import propTypes from "prop-types";

RecentProblemsRater.propTypes = {
    userInfo: propTypes.object.isRequired,
    JWT: propTypes.string.isRequired,
    JWTSetter: propTypes.func.isRequired,
};

const MAX_PROBLEMS_RATED = 200;

function RecentProblemsRater(props) {
    const [gridApi, setGridApi] = useState(null);
    const [rowData, setRowData] = useState([]);

    const onGridReady = (params) => {
        setGridApi(params.api);
    };

    // required for sliders to work
    const gridOptions = {
        getRowId: (params) => params.data.problemId,
    };

    const DifficultySliderRenderer = (params) => {
        return (
            <div className="d-flex align-items-center">
                1&nbsp;
                <input
                    type="range"
                    className="form-range rating-slider"
                    min="1"
                    max="5"
                    step="1"
                    id="range"
                    defaultValue={params.data.difficulty}
                    onMouseUp={(event) => handleRatingChange(event, params.data.problemId)}
                />
                &nbsp;5
            </div>
        );
    };

    const ReviseButton = (params) => {
        if (params.data.markedForRevision) {
            return <>In Revisions</>;
        }
        return (
            <div className="d-flex h-100 justify-content-center align-items-center">
                <button className="btn btn-sm btn-outline-dark" onClick={() => markProblemForRevision(params.data.problemId)}>
                    Revise
                </button>
            </div>
        );
    };

    const filterParams = {
        maxNumConditions: 25,
    };

    const remToPx = (rem) => {
        const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
        return rem * rootFontSize;
    };

    const columnDefs = [
        { field: "contestId", headerName: "Contest ID", sortable: true, filter: true, filterParams },
        { field: "index", headerName: "Index", sortable: true, filter: true, filterParams },
        {
            field: "name",
            headerName: "Problem Name",
            sortable: true,
            filter: true,
            cellRenderer: ProblemLinkRenderer,
            filterParams,
        },
        { field: "rating", headerName: "Rating", sortable: true, filter: true, filterParams },
        { field: "tags", headerName: "Tags", sortable: false, filter: true, cellRenderer: TagsRenderer, filterParams },
        { field: "acAttempted", headerName: "AC/Attempted", sortable: false },
        { field: "difficulty", headerName: "Difficulty", sortable: false, cellRenderer: DifficultySliderRenderer },
        { field: "revise", headerName: "", cellRenderer: ReviseButton, minWidth: remToPx(7), flex: 1 },
    ];

    useEffect(() => {
        if (!props.userInfo.problemStatuses) {
            return;
        }
        const rows = props.userInfo.problemStatuses.slice(0, MAX_PROBLEMS_RATED).map((status) => ({
            problemId: status.problem.id,
            contestId: status.problem.contestId,
            index: status.problem.index,
            name: status.problem.name,
            rating: status.problem.rating,
            tags: status.problem.tags,
            acAttempted: `${status.AC}/${status.submissions} (${Math.round((status.AC / status.submissions) * 100 * 100) / 100}%)`,
            difficulty: status.userDifficultyRating,
            markedForRevision: status.markedForRevision,
        }));
        console.log(rows);
        setRowData(rows);
    }, [props.userInfo]);

    const responseHandler = async (fn) => {
        try {
            const response = await fn().then(response => response.json());
            if (Object.prototype.hasOwnProperty.call(response, "JWT Error")) {
                props.JWTSetter("");
                return false;
            }
            return response.status !== "FAILED";
        } catch (error) {
            console.error(error);
        }
    };

    const handleRatingChange = async (event, problemId) => {
        const updatedInBackend = responseHandler(() => API.updateDifficultyRating(props.JWT, problemId, event.target.value));
        if (!updatedInBackend || !gridApi) {
            return;
        }
        const rowNode = gridApi.getRowNode(problemId);
        if (rowNode) {
            const dataToUpdate = { ...rowNode.data, difficulty: event.target.value };
            const transaction = { update: [dataToUpdate] };
            gridApi.applyTransaction(transaction);
        }
    };

    const markProblemForRevision = async (problemId) => {
        const updatedInBackend = responseHandler(() => API.markProblemForRevision(props.JWT, problemId));
        if (!updatedInBackend || !gridApi) {
            return;
        }
        const rowNode = gridApi.getRowNode(problemId);
        if (rowNode) {
            const dataToUpdate = { ...rowNode.data, markedForRevision: true };
            const transaction = { update: [dataToUpdate] };
            gridApi.applyTransaction(transaction);
            gridApi.refreshCells({ rowNodes: [rowNode], columns: ["revise"], force: true });
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
                            <div className="ag-theme-alpine mt-3" style={{ height: "45vh", width: "100%" }}>
                                <AgGridReact
                                    onGridReady={onGridReady}
                                    columnDefs={columnDefs}
                                    rowData={rowData}
                                    gridOptions={gridOptions}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RecentProblemsRater;
