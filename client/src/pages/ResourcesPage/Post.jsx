import { useState, useEffect } from "react";
import API from "../../api";
import propTypes from "prop-types";
import TagsRenderer from "../../components/TagsRenderer";

Post.propTypes = {
    userInfo: propTypes.object.isRequired,
    data: propTypes.object.isRequired, // { id, authorUsername, title, body, tags, timeCreated, upvotes, downvotes, votes }
    postsSetter: propTypes.func.isRequired,
    JWT: propTypes.string.isRequired,
    JWTSetter: propTypes.func.isRequired,
};

function Post(props) {
    const [votes, setVotes] = useState(0);
    const [isUpvoted, setIsUpvoted] = useState(false);
    const [isDownvoted, setIsDownvoted] = useState(false);

    // load data into states on init
    useEffect(() => {
        setVotes(props.data.votes);
        setIsUpvoted(props.data.upvotes.some((user) => user.username === props.userInfo.username));
        setIsDownvoted(props.data.downvotes.some((user) => user.username === props.userInfo.username));
    }, [props.data]);

    const updateVote = async (voteType) => {
        if ((voteType === "upvote" && isUpvoted) || (voteType === "downvote" && isDownvoted)) {
            voteType = "neutral";
        }
        const response = await API.updatePostVotes(props.JWT, props.data.id, voteType).then((response) => response.json());
        if (Object.prototype.hasOwnProperty.call(response, "JWT Error")) {
            props.JWTSetter("");
        }

        if (response.status === "OK") {
            const oldVote = isUpvoted ? 1 :
                            isDownvoted ? -1 :
                            0;

            const newVote = voteType === "upvote" ? 1 :
                            voteType === "downvote" ? -1 :
                            0;

            setVotes((votes) => votes + (newVote - oldVote));
            setIsUpvoted(voteType === "upvote");
            setIsDownvoted(voteType === "downvote");
        }
    };

    const deletePost = async () => {
        props.postsSetter((posts) => {
            return posts.filter((post) => post.id !== props.data.id);
        });
        API.deletePost(props.JWT, props.data.id);
    };

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
                                {votes}&nbsp;
                                {votes >= 0 ? <i className="h6 bi bi-caret-up-fill" /> : <i className="h6 bi bi-caret-down-fill" />}
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
                    {JSON.stringify(props.userInfo) === "{}" ? (
                        <></>
                    ) : (
                        <>
                            <hr />

                            <div className="d-flex justify-content-between">
                                {props.userInfo.username === props.data.authorUsername ? (
                                    <i className="bi bi-trash-fill hover-pop" onClick={deletePost}></i>
                                ) : (
                                    <>&#8203;</>
                                )}
                                <div>
                                    <i
                                        className="h5 bi bi-caret-up-fill hover-pop"
                                        style={{ color: isUpvoted ? "green" : "black" }}
                                        onClick={() => updateVote("upvote")}
                                    />
                                    &nbsp;{votes}&nbsp;
                                    <i
                                        className="h5 bi bi-caret-down-fill hover-pop"
                                        style={{ color: isDownvoted ? "red" : "black" }}
                                        onClick={() => updateVote("downvote")}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Post;
