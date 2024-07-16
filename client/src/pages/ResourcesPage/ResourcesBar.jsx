import { useState } from "react";
import Filter from "../../components/Filter";

function ResourcesBar() {
    const [tags, setTags] = useState([]);
    return (
        <div className="card card-body m-4 shadow overflow-x-auto">
            <div className="row">
                <div className="col-4">
                    <input type="text" className="form-control" id="post-name-search" placeholder="Search post name..." />
                </div>
                <div className="col-4">
                    <Filter tagsSetter={setTags} />
                </div>
                <div className="col-3 d-flex flex-nowrap align-items-baseline">
                    <div className="whitespace-nowrap">Sort:</div>
                    <select className="form-select">
                        <option selected value="1">
                            Upvotes ascending
                        </option>
                        <option value="2">Upvotes descending</option>
                        <option value="3">Time created ascending</option>
                        <option value="3">Time created descending</option>
                    </select>
                </div>
                <div className="col-1 border-dark border-start d-flex">
                    <div>
                        <div className="btn btn-outline-dark me-2">
                            <div className="d-flex align-items-baseline">
                                <i className="h6 m-0 bi bi-pencil-square"></i>
                                <span className="text-truncate">&nbsp;Create</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ResourcesBar;
