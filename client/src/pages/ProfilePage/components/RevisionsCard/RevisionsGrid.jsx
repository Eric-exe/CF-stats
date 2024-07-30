import { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import ProblemLinkRenderer from "../../../../components/ProblemLinkRenderer";
import propTypes from "prop-types";

RevisionsGrid.propTypes = {
    problemStatuses: propTypes.array.isRequired,
};

function RevisionsGrid(props) {
    const [rowData, setRowData] = useState([]);

    useEffect(() => {
        setRowData(
            props.problemStatuses.map((problemStatus) => ({
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
        if (params.data.AC === 0) return "Problem not solved";
        return (<>{JSON.stringify(params.data)}</>);
    }

    const columnDefs = [
        { field: "contestId", headerName: "Contest ID", sortable: true, filter: true },
        { field: "index", headerName: "Index", sortable: true, filter: true },
        { field: "name", headerName: "Problem Name", sortable: true, filter: true, cellRenderer: ProblemLinkRenderer, flex: 2 },
        { field: "lastAttempted", headerName: "Last Attempted", sortable: true, filter: true, flex: 1 },
        { field: "markedToRevise", headerName: "Revised?", cellRenderer: RevisedButtonRenderer, flex: 1 },
    ];

    return (
        <div className="ag-theme-alpine" style={{ height: "35vh", width: "100%" }}>
            <AgGridReact columnDefs={columnDefs} rowData={rowData} />
        </div>
    );
}

export default RevisionsGrid;
