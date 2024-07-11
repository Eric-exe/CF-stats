import propTypes from "prop-types";

ProblemStatsCard.propTypes = {
    profileInfo: propTypes.object.isRequired,
};

const BAYESIAN_MAX = 5; // if less than 5 frequency, populate with average

function ProblemStatsCard(props) {
    // handle strengths/weaknesses display
    const tags = Object.keys(props.profileInfo.tagsFrequency);
    const difficulties = {};
    for (const tag of tags) {
        // apply bayesian average to make sure small frequencies don't have much say
        const systemAdd = Math.max(BAYESIAN_MAX - props.profileInfo.tagsFrequency[tag], 0);
        difficulties[tag] = (props.profileInfo.tagsDifficulty[tag] + systemAdd * 3) / (props.profileInfo.tagsFrequency[tag] + systemAdd);
    }
    tags.sort((a, b) => difficulties[a] - difficulties[b]);
    let strengths = [];
    let weaknesses = [];
    for (let i = 0; i < tags.length && i < 7; i++) {
        strengths.push(tags[i]);
    }
    for (let i = 0; i < 7 && tags.length - i - 1 >= 7; i++) {
        weaknesses.push(tags[tags.length - i - 1]);
    }


    return (
        <div className="card shadow m-4">
            <div className="card-header" data-bs-toggle="collapse" data-bs-target="#problem-stats-body" role="button">
                <b>Problem Stats</b>
            </div>
            <div className="collapse show" id="problem-stats-body">
                <div className="container-fluid">
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-4">
                                <div>Problems attempted:&nbsp;{props.profileInfo.problemStatuses.length}</div>
                                <div>Problems AC:&nbsp;{props.profileInfo.problemsAC}</div>
                                <div>
                                    Submissions (AC/total):&nbsp;
                                    {props.profileInfo.totalAC + "/" + props.profileInfo.totalSubmissions}
                                    &nbsp;(
                                    {Math.round((props.profileInfo.totalAC / Math.max(1, props.profileInfo.totalSubmissions)) * 100 * 100) /
                                        100}
                                    %)
                                </div>
                                <hr />
                                Strengths:
                                <div>
                                    {strengths.map((strength, index) => (
                                        <div key={index} className="badge rounded-pill bg-secondary me-1">
                                            {strength}
                                        </div>
                                    ))}
                                </div>
                                Weaknesses:
                                <div>
                                    {weaknesses.map((weakness, index) => (
                                        <div key={index} className="badge rounded-pill bg-secondary me-1">
                                            {weakness}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="col-md-4">Problems Breakdown:</div>
                            <div className="col-md-4">Problems in Estimated Rating Range Breakdown:</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProblemStatsCard;
