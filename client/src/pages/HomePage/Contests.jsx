import { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import ContestLinkRenderer from "../../components/ContestLinkRenderer";
import propTypes from "prop-types";

Contests.propTypes = {
    title: propTypes.string.isRequired,
    data: propTypes.array.isRequired,
    height: propTypes.string.isRequired,
};

function Contests(props) {
    const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const columnDefs = [
        { field: "id", headerName: "ID", sortable: false, filter: false },
        { field: "name", headerName: "Contest Name", sortable: false, filter: false, flex: 2, cellRenderer: ContestLinkRenderer },
        { field: "startTime", headerName: "Start", sortable: false, filter: false, flex: 1 },
        { field: "durationMins", headerName: "Duration (minutes)", sortable: false, filter: false },
    ];

    const [rowData, setRowData] = useState([]);

    useEffect(() => {
        const rows = props.data.map((contest) => ({
            id: contest.id,
            name: contest.name,
            startTime: `${new Date(contest.startTime).toLocaleString()} (${weekday[new Date(contest.startTime).getDay()]})`,
            durationMins: contest.durationSeconds / 60
        }));
        setRowData(rows);
    }, [props.data]);

    return (
        <div className="card m-4 shadow">
            <div className="card-header">
                <b>{props.title}</b>
            </div>
            <div className="card-body">
                <div className="body d-flex justify-content-center align-items-center p-2">
                    <div className="ag-theme-alpine" style={{ height: props.height, width: "100%" }}>
                        <AgGridReact columnDefs={columnDefs} rowData={rowData}  />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Contests;
