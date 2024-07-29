import { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import ProblemLinkRenderer from "../../../../components/ProblemLinkRenderer";
import propTypes from "prop-types";

UnsolvedGrid.propTypes = {
    problemStatus: propTypes.array.isRequired,
};

function UnsolvedGrid(props) {
    const [rowData, setRowData] = useState([]);

    useEffect(() => {
        setRowData(props.problemStatus.map(problemStatus => ({
                contestId: problemStatus.problem.contestId,
                index: problemStatus.problem.index,
                name: problemStatus.problem.name,
                lastAttempted: new Date(problemStatus.lastAttempted).toLocaleString(),
            })
        ));
    }, [props.problemStatus]);

    const columnDefs = [
        { field: "contestId", headerName: "Contest ID", sortable: true, filter: true },
        { field: "index", headerName: "Index", sortable: true, filter: true },
        { field: "name", headerName: "Problem Name", sortable: true, filter: true, cellRenderer: ProblemLinkRenderer, flex: 2 },
        { field: "lastAttempted", headerName: "Last Attempted", sortable: true, filter: true, flex: 1 }
    ];

    return (
        <>
            Problems you failed to solve:
            <div className="ag-theme-alpine mt-3" style={{ height: "40vh", width: "100%" }}>
                <AgGridReact columnDefs={columnDefs} rowData={rowData} />
            </div>
        </>
    );
}

export default UnsolvedGrid;
