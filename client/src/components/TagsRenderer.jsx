import propTypes from "prop-types";

TagsRenderer.propTypes = {
    data: propTypes.object.isRequired,
};

function TagsRenderer(props) {
    return (
        <>
            {props.data.tags.map((tag, index) => (
                <div key={index} className="badge rounded-pill bg-secondary me-1">
                    {tag}
                </div>
            ))}
        </>
    );
}

export default TagsRenderer;
