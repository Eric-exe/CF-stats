import { useState } from "react";
import CreatePostModal from "./CreatePostModal";
import Filter from "../../components/Filter";
import Select from "react-select";

const SORTING_OPTIONS = [
    { value: "upvotes-asc", label: "Upvotes Ascending" },
    { value: "upvotes-desc", label: "Upvotes Descending" },
    { value: "time-asc", label: "Time Created Ascending" },
    { value: "time-desc", label: "Time Created Descending" },
];

function ResourcesBar() {
    const [tags, setTags] = useState([]);

    return (
        <>
            <div className="card card-body m-4 shadow">
                <div className="row overflow-auto">
                    <div className="col-1 d-flex align-items-center text-nowrap min-width-fit-content">Search:</div>
                    <div className="col-xl-11">
                        <div className="row">
                            <div className="col-md-4">
                                <input type="text" className="form-control" id="post-name-search" placeholder="Post name..." />
                            </div>
                            <div className="col-md-4">
                                <Filter tagsSetter={setTags} />
                            </div>
                            <div className="col-md-4">
                                <div className="d-flex align-items-baseline">
                                    <div className="whitespace-nowrap">Sort:&nbsp;</div>
                                    <Select
                                        className="flex-grow-1"
                                        defaultValue={SORTING_OPTIONS[1]}
                                        isClearable={false}
                                        options={SORTING_OPTIONS}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <hr />
                <div className="row d-flex justify-content-center">
                    <div className="col-lg-1">
                        <div className="btn btn-outline-dark d-flex justify-content-center min-width-fit-content">
                            <i className="bi bi-person-fill"></i>
                            &nbsp;Me
                        </div>
                    </div>
                    <div className="col-lg-2">
                        <div className="btn btn-outline-dark d-flex justify-content-center min-width-fit-content" data-bs-toggle="modal" data-bs-target="#crea">
                            <i className="bi bi-pencil-square"></i>
                            &nbsp;Create post
                        </div>
                    </div>
                </div>
            </div>

            <CreatePostModal />
        </>
    );
}

export default ResourcesBar;
