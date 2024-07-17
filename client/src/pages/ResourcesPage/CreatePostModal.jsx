import { useState } from "react";
import Filter from "../../components/Filter";

function CreatePostModal() {
    const [tags, setTags] = useState([]);

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
                        <input type="text" className="form-control" id="post-title" placeholder="Post Title" />
                        <textarea className="form-control mt-3" id="post-body" rows="10" placeholder="Post content" />
                    </div>
                    <div className="mx-3 mb-3">
                        <Filter tagsSetter={setTags} />
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-outline-dark">
                            Create Post
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreatePostModal;
