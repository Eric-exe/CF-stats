import propTypes from "prop-types";

ProblemsLinkRenderer.propTypes = {
    data: propTypes.object.isRequired,
}

function ProblemsLinkRenderer(params) {
    return (
        <a href={`https://codeforces.com/contest/${params.data.contestId}/problem/${params.data.index}`}>
            {params.data.name}
        </a>
    );
}

export default ProblemsLinkRenderer;