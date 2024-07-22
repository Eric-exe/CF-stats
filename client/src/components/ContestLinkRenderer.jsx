import propTypes from "prop-types";

ContestLinkRenderer.propTypes = {
    data: propTypes.object.isRequired,
}

function ContestLinkRenderer(params) {
    return (
        <a href={`https://codeforces.com/contest/${params.data.id}`}>
            {params.data.name}
        </a>
    );
}

export default ContestLinkRenderer;