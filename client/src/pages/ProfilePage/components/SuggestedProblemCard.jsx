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