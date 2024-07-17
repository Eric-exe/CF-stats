import { useState } from "react";
import Filter from "../../components/Filter";
import API from "../../api";
import propTypes from "prop-types";

CreatePostModal.propTypes = {
    JWT: propTypes.string.isRequired,
    JWTSetter: propTypes.func.isRequired,
    postsSetter: propTypes.func.isRequired,
    updatePosts: propTypes.func.isRequired, 
};

function CreatePostModal(props) {
    const [tags, setTags] = useState([]);
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [statusMessage, setStatusMessage] = useState("");

    const handleCreatePost = async () => {
        if (title === "") {
            setStatusMessage("Title is required");
            return;
        }
        if (body === "") {
            setStatusMessage("Post content is required");
            return;
        }

        console.log(body);
        const response = await API.createPost(props.JWT, title, body, tags).then((response) => response.json());
        if (Object.prototype.hasOwnProperty.call(response, "JWT Error")) {
            props.JWTSetter("");
        }

        setTags([]);
        setTitle("");
        setBody("");
        setStatusMessage("");

        const modalInstance = bootstrap.Modal.getInstance(document.getElementById("create-post-modal"));
        if (modalInstance) {
            modalInstance.hide();
        }

        props.updatePosts();
    };

    return (
        <div className="modal fade modal-xl" tabIndex="-1" id="create-post-modal">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <i className="bi bi-pencil-square"></i>
                            &nbsp;Create New Post
                        </h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div className="modal-body">
                        <div className="text-danger mb-1">{statusMessage}</div>
                        <input
                            type="text"
                            className="form-control"
                            id="post-title"
                            placeholder="Post Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <textarea
                            className="form-control mt-3"
                            id="post-body"
                            rows="10"
                            placeholder="Post content"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                        />
                    </div>
                    <div className="mx-3 mb-3">
                        <Filter tagsSetter={setTags} />
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-outline-dark" onClick={handleCreatePost}>
                            Create Post
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreatePostModal;
