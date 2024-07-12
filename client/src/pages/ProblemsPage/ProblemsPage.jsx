import { useState } from "react";
import Filter from "../../components/Filter";

function ProblemsPage() {
    const [ratingStart, setRatingStart] = useState("");
    const [ratingEnd, setRatingEnd] = useState("");
    const [tags, setTags] = useState([]);

    return (
        <div className="card shadow m-4">
            <div className="card-header overflow-auto">Problems</div>
            <div className="card-body">
                <div className="row">
                    <div className="col-lg-5 d-flex align-items-baseline">
                        Search:&nbsp;
                        <div className="flex-grow-1">
                            <input className="form-control" type="text" placeholder="Problem name" />
                        </div>
                    </div>
                    <div className="col-lg-7 mt-lg-0 mt-2">
                        <Filter
                            ratingStart={ratingStart}
                            ratingStartSetter={setRatingStart}
                            ratingEnd={ratingEnd}
                            ratingEndSetter={setRatingEnd}
                            tagsSetter={setTags}
                        />
                    </div>
                </div>

                <table className="table table-striped mt-3">
                    <thead>
                        <tr>
                            <th scope="col">
                                <div className="d-flex text-nowrap justify-content-between">
                                    Contest ID
                                    <i className="bi bi-caret-down-fill"></i>
                                </div>
                            </th>
                            <th scope="col">
                                <div className="d-flex text-nowrap justify-content-between">
                                    Index
                                    <i className="bi bi-caret-down-fill"></i>
                                </div>
                            </th>
                            <th scope="col">
                                <div className="d-flex text-nowrap justify-content-between">
                                    Problem
                                    <i className="bi bi-caret-down-fill"></i>
                                </div>
                            </th>

                            <th scope="col">Rating</th>
                            <th scope="col">Tags</th>
                        </tr>
                    </thead>
                    <tbody className="table-group-divider" style={{"maxWidth": "100vh"}}>
                        <tr>
                            <td>DUMMY_DATA_1</td>
                            <td>DUMMY_DATA_2</td>
                            <td>DUMMY_DATA_3</td>
                            <td>DUMMY_DATA_4</td>
                            <td>DUMMY_DATA_4</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ProblemsPage;
