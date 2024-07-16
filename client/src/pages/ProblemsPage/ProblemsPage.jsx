import { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import LinkRenderer from "../../components/LinkRenderer";
import TagsRenderer from "../../components/TagsRenderer";
import API from "../../api";
import propTypes from "prop-types";

ProblemsPage.propTypes = {
    userInfo: propTypes.object.isRequired,
};

function ProblemsPage(props) {
    const [rowData, setRowData] = useState([]);

    const filterParams = {
        maxNumConditions: 25,
    };

    const columnDefs = [
        { field: "contestId", headerName: "Contest ID", sortable: true, filter: true, filterParams },
        { field: "index", headerName: "Index", sortable: true, filter: true, filterParams },
        { field: "name", headerName: "Name", sortable: true, filter: true, flex: 1, cellRenderer: LinkRenderer, filterParams },
        { field: "rating", headerName: "Rating", sortable: true, filter: true, filterParams },
        { field: "tags", headerName: "Tags", sortable: false, filter: true, flex: 1, cellRenderer: TagsRenderer, filterParams },
    ];

    useEffect(() => {
        const getProblemsData = async () => {
            const problemsData = await API.getProblemsData().then((response) => response.json());
            // turn into hashmap for faster status updates for the user
            const data = problemsData.map((problem) => ({
                id: problem.id,
                contestId: problem.contestId,
                index: problem.index,
                name: problem.name,
                rating: problem.rating === -1 ? null : problem.rating,
                tags: problem.tags,
                status: "None",
            }));
            setRowData(data);
        };
        getProblemsData();
    }, []);

    // paint the rows different color if the user has solved/attempted a problem
    useEffect(() => {
        if (!props.userInfo || !props.userInfo.problemStatuses) return;
        const updatedRowData = [...rowData];
        for (const problemStatus of props.userInfo.problemStatuses) {
            const index = updatedRowData.findIndex((row) => row.id === problemStatus.problem.id);
            if (index !== -1) {
                if (problemStatus.AC === 0) {
                    updatedRowData[index].status = "FAILED";
                } else {
                    updatedRowData[index].status = "OK";
                }
            }
        }
        setRowData(updatedRowData);
    }, [props.userInfo]);

    const gridOptions = {
        getRowStyle: params => {
            if (params.data.status === "OK") {
                return { background: "lightgreen" }
            }
            else if (params.data.status === "FAILED") {
                return { background: "salmon" }
            }
        }
    }

    return (
        <div className="card shadow m-4">
            <div className="card-header overflow-auto">
                <b>Problems</b>
            </div>
            <div className="body d-flex justify-content-center align-items-center p-4">
                <div className="ag-theme-alpine" style={{ height: "75vh", width: "95vw" }}>
                    <AgGridReact columnDefs={columnDefs} rowData={rowData} gridOptions={gridOptions} />
                </div>
            </div>
        </div>
    );
}

export default ProblemsPage;
