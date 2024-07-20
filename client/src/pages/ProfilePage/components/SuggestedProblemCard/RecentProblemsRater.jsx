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

    const filterParams = {
        maxNumConditions: 25,
    };
    
    const columnDefs = [
        { field: "contestId", headerName: "Contest ID", sortable: true, filter: true, filterParams },
        { field: "index", headerName: "Index", sortable: true, filter: true, filterParams },
        { field: "name", headerName: "Problem Name", sortable: true, filter: true, cellRenderer: ProblemLinkRenderer, flex: 1, filterParams },
        { field: "rating", headerName: "Rating", sortable: true, filter: true, filterParams },
        { field: "tags", headerName: "Tags", sortable: false, filter: true, cellRenderer: TagsRenderer, flex: 1, filterParams },
        { field: "acAttempted", headerName: "AC/Attempted", sortable: false },
        { field: "difficulty", headername: "Difficulty", sortable: false, cellRenderer: DifficultySliderRenderer },
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
        }));
        setRowData(rows);
    }, [props.userInfo]);

    const handleRatingChange = (event, problemId) => {
        const updateUserDifficultyRatingInDB = async () => {
            try {
                const data = await API.updateDifficultyRating(props.JWT, problemId, event.target.value).then((response) => response.json());
                if (Object.prototype.hasOwnProperty.call(data, "JWT Error")) {
                    props.JWTSetter("");
                }
            } catch (error) {
                console.error(error);
            }
        }
        updateUserDifficultyRatingInDB(event, problemId);

        // update visually
        if (!gridApi) {
            return;
        }
        const rowNode = gridApi.getRowNode(problemId);
        if (rowNode) {
            const dataToUpdate = { ...rowNode.data, difficulty: event.target.value };
            const transaction = { update: [dataToUpdate] };
            gridApi.applyTransaction(transaction);
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
