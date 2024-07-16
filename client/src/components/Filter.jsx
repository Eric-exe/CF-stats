import Select from "react-select";
import propTypes from "prop-types";

const OPTIONS = [
    { value: "dfs and similar", label: "dfs and similar" },
    { value: "divide and conquer", label: "divide and conquer" },
    { value: "graphs", label: "graphs" },
    { value: "combinatorics", label: "combinatorics" },
    { value: "dp", label: "dp" },
    { value: "math", label: "math" },
    { value: "brute force", label: "brute force" },
    { value: "data structures", label: "data structures" },
    { value: "greedy", label: "greedy" },
    { value: "sortings", label: "sortings" },
    { value: "two pointers", label: "two pointers" },
    { value: "implementation", label: "implementation" },
    { value: "interactive", label: "interactive" },
    { value: "trees", label: "trees" },
    { value: "dsu", label: "dsu" },
    { value: "games", label: "games" },
    { value: "hashing", label: "hashing" },
    { value: "number theory", label: "number theory" },
    { value: "binary search", label: "binary search" },
    { value: "geometry", label: "geometry" },
    { value: "constructive algorithms", label: "constructive algorithms" },
    { value: "string suffix structures", label: "string suffix structures" },
    { value: "bitmasks", label: "bitmasks" },
    { value: "meet-in-the-middle", label: "meet-in-the-middle" },
    { value: "matrices", label: "matrices" },
    { value: "ternary search", label: "ternary search" },
    { value: "fft", label: "fft" },
    { value: "shortest paths", label: "shortest paths" },
    { value: "2-sat", label: "2-sat" },
    { value: "probabilities", label: "probabilities" },
    { value: "flows", label: "flows" },
    { value: "*special", label: "*special" },
    { value: "graph matchings", label: "graph matchings" },
    { value: "schedules", label: "schedules" },
    { value: "expression parsing", label: "expression parsing" },
    { value: "chinese remainder theorem", label: "chinese remainder theorem" },
];

Filter.propTypes = {
    ratingStart: propTypes.string.isRequired,
    ratingStartSetter: propTypes.func.isRequired,
    ratingEnd: propTypes.string.isRequired,
    ratingEndSetter: propTypes.func.isRequired,
    tagsSetter: propTypes.func.isRequired,
};

function Filter(props) {
    return (
        <div className="row">
            <div className="col-6">
                <div className="d-flex align-items-baseline">
                    <div className="text-nowrap">Rating:&nbsp;</div>
                    <div>
                        <input
                            className="form-control rating-input"
                            type="number"
                            value={props.ratingStart}
                            onChange={(event) => props.ratingStartSetter(event.target.value)}
                        />
                    </div>
                    <div className="text-nowrap">&nbsp;-&nbsp;</div>
                    <div>
                        <input
                            className="form-control rating-input"
                            type="number"
                            value={props.ratingEnd}
                            onChange={(event) => props.ratingEndSetter(event.target.value)}
                        />
                    </div>
                </div>
            </div>
            <div className="col-6 d-flex align-items-baseline">
                Tags:&nbsp;
                <Select
                    options={OPTIONS}
                    isMulti
                    className="flex-grow-1"
                    onChange={(tags) => props.tagsSetter(tags.map((tag) => tag.value))}
                />
            </div>
        </div>
    );
}

export default Filter;
