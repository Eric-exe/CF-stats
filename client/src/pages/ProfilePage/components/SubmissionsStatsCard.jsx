import { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import ProblemsLinkRenderer from "../../../components/ProblemLinkRenderer";
import propTypes from "prop-types";

SubmissionsStatsCard.propTypes = {
    profileInfo: propTypes.object.isRequired,
};

function SubmissionsStatsCard(props) {
    const [rowData, setRowData] = useState([]);

    const SubmissionLinkRenderer = (params) => {
        return (
            <a href={`https://codeforces.com/contest/${params.data.contestId}/submission/${params.data.submissionId}`}>
                {params.data.submissionId}
            </a>
        )
    }

    const columnDefs = [
        { field: "submissionId", headerName: "Submission ID", sortable: true, filter: true, cellRenderer: SubmissionLinkRenderer },
        { field: "name", headerName: "Problem Name", sortable: true, filter: true, cellRenderer: ProblemsLinkRenderer, flex: 1},
        { field: "verdict", headerName: "Status", sortable: true, filter: true },
        { field: "time", headerName: "Submission Time" },
        { field: "programmingLang", headerName: "Programming Language", sortable: true, filter: true },
        { field: "timeUsed", headername: "Time (ms)", sortable: true, filter: true },
        { field: "memoryUsed", headerName: "Memory (kb)", sortable: true, filter: true },
    ];

    useEffect(() => {
        if (!props.profileInfo.submissions) {
            return;
        }
        const rows = props.profileInfo.submissions.map((submission) => ({
            // contestId and index field required for link rendering
            contestId: submission.problem.contestId,
            index: submission.problem.index,

            submissionId: submission.id,
            name: submission.problem.name,
            verdict: submission.verdict,
            time: new Date(submission.timeCreated).toLocaleString(),
            programmingLang: submission.programmingLang,
            timeUsed: submission.timeUsed,
            memoryUsed: submission.memoryUsed,
        }));
        setRowData(rows);
    }, [props.profileInfo]);

    return (
        <div className="card shadow m-4">
            <div className="card-header" data-bs-toggle="collapse" data-bs-target="#submissions-stats-body" role="button">
                <b>Recent Submissions</b>
            </div>
            <div className="collapse show" id="submissions-stats-body">
                <div className="container-fluid">
                    <div className="card-body d-flex justify-content-center">
                        <div className="ag-theme-alpine" style={{ height: "45vh", width: "95vw" }}>
                            <AgGridReact columnDefs={columnDefs} rowData={rowData} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SubmissionsStatsCard;
