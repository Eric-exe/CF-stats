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
            <a href={`https://codeforces.com/contest/${params.data.contestId}/submission/${params.data.submissionId}`} target="_blank">
                {params.data.submissionId}
            </a>
        )
    }

    const columnDefs = [
        { field: "submissionId", headerName: "Submission ID", sortable: true, filter: true, cellRenderer: SubmissionLinkRenderer },
        { field: "name", headerName: "Problem Name", sortable: true, filter: true, cellRenderer: ProblemsLinkRenderer, flex: 2 },
        { field: "verdict", headerName: "Status", sortable: true, filter: true },
        { field: "time", headerName: "Submission Time", sortable: false },
        { field: "programmingLang", headerName: "Programming Language", sortable: false },
        { field: "timeUsed", headerName: "Time (ms)", sortable: false },
        { field: "memoryUsed", headerName: "Memory (kb)", sortable: false },
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
                        <div className="ag-theme-alpine" style={{ height: "45vh", width: "100%" }}>
                            <AgGridReact columnDefs={columnDefs} rowData={rowData} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SubmissionsStatsCard;
