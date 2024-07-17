import propTypes from "prop-types";
import TagsRenderer from "../../components/TagsRenderer";

Post.propTypes = {
    data: propTypes.object.isRequired, // { id, authorUsername, title, body, tags, timeCreated, upvotes, downvotes, votes }
};

function Post(props) {
    return (
        <div className="accordion-item">
            <h2 className="accordion-header">
                <button
                    className="accordion-button overflow-auto collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#post-${props.data.id}`}
                >
                    <div className="d-flex flex-grow-1 align-items-baseline justify-content-between me-3">
                        <div className="me-3">{props.data.title}</div>
                        <div className="d-flex text-sm">
                            <div className="text-end">{props.data.authorUsername}&nbsp;</div>
                            <div className="text-end" style={{ width: "14rem" }}>
                                {new Date(props.data.timeCreated).toLocaleString()}
                            </div>
                            <div className="text-end" style={{ width: "6rem" }}>
                                {props.data.votes}&nbsp;
                                {props.data.votes >= 0 ? (
                                    <i className="h6 bi bi-caret-up-fill" />
                                ) : (
                                    <i className="h6 bi bi-caret-down-fill" />
                                )}
                            </div>
                        </div>
                    </div>
                </button>
            </h2>

            <div id={`post-${props.data.id}`} className="accordion-collapse collapse" data-bs-parent="#posts-accordion">
                <div className="accordion-body">
                    <TagsRenderer data={{ tags: props.data.tags }} />
                    <div className="mt-2">
                        <pre style={{ whiteSpace: "pre-wrap" }}>{props.data.body}</pre>
                    </div>
                    <hr />

                    <div className="d-flex justify-content-end">
                        <i className="h5 bi bi-caret-up-fill" />
                        &nbsp;{props.data.votes}&nbsp;
                        <i className="h5 bi bi-caret-down-fill" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Post;
