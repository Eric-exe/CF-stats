import { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import LinkRenderer from "../../components/LinkRenderer";
import TagsRenderer from "../../components/TagsRenderer";
import API from "../../api";

function ProblemsPage() {
    const [rowData, setRowData] = useState([]);

    const columnDefs = [
        { field: "contestId", headerName: "Contest ID", sortable: true, filter: true },
        { field: "index", headerName: "Index", sortable: true, filter: true },
        {
            field: "name",
            headerName: "Name",
            sortable: true,
            filter: true,
            flex: 1,
            cellRenderer: LinkRenderer,
        },
        { field: "rating", headerName: "Rating", sortable: true, filter: true },
        { field: "tags", headerName: "Tags", sortable: false, filter: true, flex: 1, cellRenderer: TagsRenderer },
    ];

    useEffect(() => {
        const getProblemsData = async () => {
            const problemsData = await API.getProblemsData().then((response) => response.json());
            const data = problemsData.map((problem) => ({
                contestId: problem.contestId,
                index: problem.index,
                name: problem.name,
                rating: problem.rating,
                tags: problem.tags,
            }));
            setRowData(data);
        };
        getProblemsData();
    }, []);

    return (
        <div className="card shadow m-4">
            <div className="card-header overflow-auto">Problems</div>
            <div className="body d-flex justify-content-center align-items-center p-4">
                <div className="ag-theme-alpine" style={{ height: "75vh", width: "95vw" }}>
                    <AgGridReact columnDefs={columnDefs} rowData={rowData} />
                </div>
            </div>
        </div>
    );
}

export default ProblemsPage;
