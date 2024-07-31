import { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import ProblemLinkRenderer from "../../components/ProblemLinkRenderer";
import TagsRenderer from "../../components/TagsRenderer";
import propTypes from "prop-types";
import RatingRenderer from "../../components/RatingRenderer";

ProblemsPage.propTypes = {
    userInfo: propTypes.object.isRequired,
    problemsData: propTypes.array.isRequired, 
};

function ProblemsPage(props) {
    const [rowData, setRowData] = useState([]);

    const filterParams = {
        maxNumConditions: 25,
    };

    const columnDefs = [
        { field: "contestId", headerName: "Contest ID", sortable: true, filter: true, filterParams },
        { field: "index", headerName: "Index", sortable: true, filter: true, filterParams },
        {
            field: "name",
            headerName: "Problem Name",
            sortable: true,
            filter: true,
            flex: 1,
            cellRenderer: ProblemLinkRenderer,
            filterParams,
        },
        { field: "rating", headerName: "Rating", sortable: true, filter: true, filterParams: { maxNumConditions: 25 }, cellRenderer: RatingRenderer },
        { field: "tags", headerName: "Tags", sortable: false, filter: true, flex: 1, cellRenderer: TagsRenderer, filterParams },
    ];

    // paint the rows different color if the user has solved/attempted a problem
    useEffect(() => {
        const rows = props.problemsData.map((problem) => {
            const problemStatus = props.userInfo.problemStatuses
                ? props.userInfo.problemStatuses.find((status) => status.problem.id === problem.id)
                : undefined;

            let status = problemStatus ? (problemStatus.AC > 0 ? "OK" : "FAILED") : "None";

            return {
                id: problem.id,
                contestId: problem.contestId,
                index: problem.index,
                name: problem.name,
                rating: problem.rating,
                tags: problem.tags,
                status,
            };
        });
        setRowData(rows);
    }, [props.userInfo, props.problemsData]);

    const gridOptions = {
        getRowStyle: (params) => {
            if (params.data.status === "OK") {
                return { background: "lightgreen" };
            } else if (params.data.status === "FAILED") {
                return { background: "lightpink" };
            }
        },
    };

    return (
        <div className="container-fluid">
            <div className="card shadow m-4">
                <div className="card-header overflow-auto">
                    <b>Problems</b>
                </div>
                <div className="body d-flex justify-content-center align-items-center p-4">
                    <div className="ag-theme-alpine" style={{ height: "75vh", width: "100%" }}>
                        <AgGridReact columnDefs={columnDefs} rowData={rowData} gridOptions={gridOptions} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProblemsPage;
