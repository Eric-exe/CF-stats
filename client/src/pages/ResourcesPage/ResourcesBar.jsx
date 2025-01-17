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
    const [inPersonal, setInPersonal] = useState(false); // display personal instead of all posts

    // debounce fn: https://www.inkoop.io/blog/debounce-and-throttle-javascript-edition/
    let searchDebounceTimer = null;
    const debounce = (func, delay) => {
        return (...args) => {
            if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
            searchDebounceTimer = setTimeout(() => func(...args), delay);
        };
    };

    const postsResponseHandler = (response) => {
        if (response.status === "OK") {
            props.postsSetter(response.posts);
        }
    };

    const getPosts = async () => {
        const response = await API.getPosts(title, tags, sortBy).then((response) => response.json());
        postsResponseHandler(response);
    };

    useEffect(() => {
        const debounceFn = debounce(() => {
            getPosts();
        }, 300);
        debounceFn();
    }, [title, tags, sortBy]);

    const getPersonalPosts = async () => {
        const fn = inPersonal ? () => API.getPosts(title, tags, sortBy) : () => API.getPersonalPosts(props.JWT);

        setInPersonal((oldInPersonal) => !oldInPersonal);
        const response = await fn().then((response) => response.json());
        if (response.status === "OK") {
            props.postsSetter(response.posts);
        }
    };

    return (
        <>
            <div className="card card-body m-4 shadow">
                <div className="row">
                    <div className="col-lg-4">
                        <div>
                            <div className="d-flex align-items-center">
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
                                <div
                                    className={
                                        "btn btn-outline-dark d-flex justify-content-center min-width-fit-content " +
                                        (inPersonal ? "active" : "")
                                    }
                                    onClick={getPersonalPosts}
                                >
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

            <CreatePostModal JWT={props.JWT} JWTSetter={props.JWTSetter} postsSetter={props.postsSetter} updatePosts={getPosts} />
        </>
    );
}

export default ResourcesBar;
