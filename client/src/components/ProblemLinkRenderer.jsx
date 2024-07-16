import propTypes from "prop-types";

ProblemLinkRenderer.propTypes = {
    data: propTypes.object.isRequired,
}

function ProblemLinkRenderer(params) {
    return (
        <a href={`https://codeforces.com/contest/${params.data.contestId}/problem/${params.data.index}`}>
            {params.data.name}
        </a>
    );
}

export default ProblemLinkRenderer;