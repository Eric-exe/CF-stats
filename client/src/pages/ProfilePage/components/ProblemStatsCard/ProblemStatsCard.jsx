import { useState, useEffect } from "react";
import TagsPieChart from "./TagsPieChart";
import propTypes from "prop-types";

ProblemStatsCard.propTypes = {
    profileInfo: propTypes.object.isRequired,
    metadata: propTypes.object.isRequired, 
};

const MAX_TAGS_TO_DISPLAY = 7;
const BAYESIAN_MAX = 5; // if less than 5 frequency, populate with average
const SYSTEM_ADD_DIFFICULTY = 3;

function ProblemStatsCard(props) {
    const [strengths, setStrengths] = useState([]);
    const [weaknesses, setWeaknesses] = useState([]);
    const [tagsInEstimatedRange, setTagsInEstimatedRange] = useState({});

    useEffect(() => {
        /*
        Calculate the average difficulty of each tag with tagsDifficulty[tag] / tagsFrequency[tag].

        Edge case:
        If a tag has only a few problems solved (tagsFrequency), it is not really reflective of the user's
        skill on said tag. To counteract this, we can add some dummy difficulties to lower the impact of a tag.

        For example, a tag with difficulty 1 and frequency 1 isn't really reflective of the user's skill in that tag
        will have the average difficulty of 1. With bayesian average, the average difficulty is:
        (1 + (5 - 1) * 3) / (1 + 4) = 13/5 = 2.6
        */
        const tags = Object.keys(props.profileInfo.tagsFrequency);
        const difficulties = {};
        for (const tag of tags) {
            // apply bayesian average to make sure small frequencies don't have much say
            const systemAdd = Math.max(BAYESIAN_MAX - props.profileInfo.tagsFrequency[tag], 0);
            difficulties[tag] =
                (props.profileInfo.tagsDifficulty[tag] + systemAdd * SYSTEM_ADD_DIFFICULTY) /
                (props.profileInfo.tagsFrequency[tag] + systemAdd);
        }
        tags.sort((a, b) => difficulties[a] - difficulties[b]);

        let strengthTags = [];
        let weaknessTags = [];

        for (let i = 0; i < tags.length && i < MAX_TAGS_TO_DISPLAY; i++) {
            strengthTags.push(tags[i]);
        }
        for (let i = 0; i < MAX_TAGS_TO_DISPLAY && tags.length - i - 1 >= MAX_TAGS_TO_DISPLAY; i++) {
            weaknessTags.push(tags[tags.length - i - 1]);
        }

        setStrengths(strengthTags);
        setWeaknesses(weaknessTags);
    }, [props.profileInfo]);

    useEffect(() => {
        console.log(props.metadata);
        if (props.metadata.problemsTagsSpread === undefined) {
            return;
        }
        // CF rating is bounded [800, 3500]
        let roundedEstimatedRating = Math.round(props.profileInfo.estimatedRating / 100) * 100;
        roundedEstimatedRating = Math.max(roundedEstimatedRating, 800);
        roundedEstimatedRating = Math.min(roundedEstimatedRating, 3500);
        setTagsInEstimatedRange(props.metadata.problemsTagsSpread[roundedEstimatedRating]);
    }, [props.metadata]);

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

                            <div className="col-md-4">
                                Problems Breakdown:
                                <TagsPieChart data={props.profileInfo.tagsFrequency}/>
                            </div>
                            <div className="col-md-4">
                                Problems in Estimated Rating Range Breakdown:
                                <TagsPieChart data={tagsInEstimatedRange}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProblemStatsCard;
