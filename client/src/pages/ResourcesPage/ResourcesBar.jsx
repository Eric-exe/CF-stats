import { useState, useEffect } from "react";
import CreatePostModal from "./CreatePostModal";
import Filter from "../../components/Filter";
import Select from "react-select";
import propTypes from "prop-types";
import API from "../../api";

const SORTING_OPTIONS = [
    { value: "votes-asc", label: "Upvotes Ascending" },
    { value: "votes-desc", label: "Upvotes Descending" },
    { value: "timeCreated-asc", label: "Time Created Ascending" },
    { value: "timeCreated-desc", label: "Time Created Descending" },
];

ResourcesBar.propTypes = {
    isLoggedIn: propTypes.bool.isRequired,
    JWT: propTypes.string.isRequired,
    JWTSetter: propTypes.func.isRequired,
    postsSetter: propTypes.func.isRequired,
};

function ResourcesBar(props) {
    // search bar states
    const [title, setTitle] = useState("");
    const [tags, setTags] = useState([]);
    const [sortBy, setSortBy] = useState("votes-desc");

    const getPosts = async() => {
        const response = await API.getPosts(title, tags, sortBy).then(response => response.json());
        if (response.status === "OK") {
            props.postsSetter(response.posts);
        }
    }

    useEffect(() => {
        getPosts();
    }, [title, tags, sortBy]);

    return (
        <>
            <div className="card card-body m-4 shadow">
                <div className="row">
                    <div className="col-lg-4 d-flex align-items-baseline">
                        <div className="text-nowrap">Search Post Name:&nbsp;</div>
                        <div className="d-flex flex-grow-1">
                            <input
                                type="text"
                                className="form-control flex-grow-1"
                                id="post-name-search"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="col-lg-4">
                        <Filter tagsSetter={setTags} />
                    </div>
                    <div className="col-lg-4">
                        <div className="d-flex align-items-baseline">
                            <div className="whitespace-nowrap">Sort:&nbsp;</div>
                            <Select
                                className="flex-grow-1"
                                defaultValue={SORTING_OPTIONS[1]}
                                isClearable={false}
                                options={SORTING_OPTIONS}
                                onChange={(sort) => setSortBy(sort.value)}
                            />
                        </div>
                    </div>
                </div>
                {props.isLoggedIn ? (
                    <>
                        <hr />
                        <div className="row d-flex justify-content-center">
                            <div className="col-lg-1">
                                <div className="btn btn-outline-dark d-flex justify-content-center min-width-fit-content">
                                    <i className="bi bi-person-fill"></i>
                                    &nbsp;Me
                                </div>
                            </div>
                            <div className="col-lg-2">
                                <div
                                    className="btn btn-outline-dark d-flex justify-content-center min-width-fit-content"
                                    data-bs-toggle="modal"
                                    data-bs-target="#create-post-modal"
                                >
                                    <i className="bi bi-pencil-square"></i>
                                    &nbsp;Create post
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <></>
                )}
            </div>

            <CreatePostModal JWT={props.JWT} JWTSetter={props.JWTSetter} postsSetter={props.postsSetter} updatePosts={getPosts}/>
        </>
    );
}

export default ResourcesBar;
