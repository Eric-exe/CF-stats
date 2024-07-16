import propTypes from "prop-types";

LinkRenderer.propTypes = {
    data: propTypes.object.isRequired,
}

function LinkRenderer(props) {
    return (
        <a href={`https://codeforces.com/contest/${props.data.contestId}/problem/${props.data.index}`}>
            {props.data.name}
        </a>
    );
}

export default LinkRenderer;