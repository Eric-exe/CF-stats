const PROBLEM_TAGS = [
    "dfs and similar",
    "divide and conquer",
    "graphs",
    "combinatorics",
    "dp",
    "math",
    "brute force",
    "data structures",
    "greedy",
    "sortings",
    "two pointers",
    "implementation",
    "interactive",
    "trees",
    "dsu",
    "games",
    "hashing",
    "number theory",
    "binary search",
    "geometry",
    "constructive algorithms",
    "string suffix structures",
    "bitmasks",
    "meet-in-the-middle",
    "matrices",
    "ternary search",
    "fft",
    "shortest paths",
    "2-sat",
    "probabilities",
    "flows",
    "*special",
    "graph matchings",
    "schedules",
    "expression parsing",
    "chinese remainder theorem"
]

function SuggestedProblemCard() {
    return (
        <div className="card shadow m-4">
            <div className="card-header" data-bs-toggle="collapse" data-bs-target="#suggested-problem-body" role="button">
                <b>Suggested Problem</b>
            </div>
            <div className="collapse show" id="suggested-problem-body">
                <div className="container-fluid">
                    <div className="card-body">
                        Hi
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SuggestedProblemCard;