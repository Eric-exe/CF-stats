import { useState } from "react";
import API from "../../../api.js";
import propTypes from "prop-types";

LinkCodeforcesAccount.propTypes = {
    profileUsername: propTypes.string.isRequired,
    JWT: propTypes.string.isRequired,
    profileInfoSetter: propTypes.func.isRequired,
    profileIsUpdatingSetter: propTypes.func.isRequired,
};
function LinkCodeforcesAccount(props) {
    const [status, setStatus] = useState("");
    const [statusIsGood, setStatusIsGood] = useState(true); // determines the color of the staus
    const [potentialHandle, setPotentialHandle] = useState("");
    const [key, setKey] = useState("");

    const genKey = async () => {
        const data = await API.getCFLinkKey(props.JWT).then((response) => response.json());
        if (Object.prototype.hasOwnProperty.call(data, "error")) {
            setStatus(data.error);
            setKey("N/A");
        }
        else {
            setKey(data["key"]);
        }
    };

    const handleCFLink = async () => {
        const data = await API.linkCF(potentialHandle, props.JWT).then((response) => response.json());
        if (Object.prototype.hasOwnProperty.call(data, "error")) {
            // linking failed
            setStatus(data.error);
            setStatusIsGood(false);
        } else {
            // linking successful, update and display user info
            setStatus("Handle linked!");
            setStatusIsGood(true);
            bootstrap.Modal.getInstance(document.getElementById("cfLinkModal")).hide();
            props.profileInfoSetter(data => ({...data, handle: potentialHandle}));
            setPotentialHandle("");

            props.profileIsUpdatingSetter(true);
            await API.updateUserInfo(props.profileUsername);
            await API.getPersonalUserInfo(props.JWT)
                .then((response) => response.json())
                .then((data) => props.profileInfoSetter(data));
            props.profileIsUpdatingSetter(false);
        }
    };

    return (
        <>
            <div className="d-inline-block">
                <button className="btn btn-sm btn-outline-dark" data-bs-toggle="modal" data-bs-target="#cfLinkModal" onClick={genKey}>
                    Link Account
                </button>
            </div>

            <div className="modal modal-lg fade" id="cfLinkModal" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="exampleModalLabel">
                                Link your Codeforces Account
                            </h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            {key === "" ? (
                                <>Loading...</>
                            ) : (
                                <>
                                    <>
                                        <div className={statusIsGood ? "text-success" : "text-danger"}>{status}</div>
                                    </>
                                    <div className="row my-2">
                                        <div className="col-3 my-auto">Codeforces Handle:</div>
                                        <div className="col-9">
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="potentialHandleForm"
                                                placeholder="Your Codeforces handle"
                                                value={potentialHandle}
                                                onChange={(event) => {
                                                    setPotentialHandle(event.target.value);
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="row mb-4">
                                        <div className="col-3 my-auto">Key:</div>
                                        <div className="col-9 my-auto">{key}</div>
                                    </div>
                                    To link your Codeforces account:
                                    <ol>
                                        <li>Input your Codeforces handle above</li>
                                        <li>Head to https://codeforces.com/settings/social</li>
                                        <li>Set first name (english) to the key above (you can change it after linking)</li>
                                        <li>Click Link Account</li>
                                    </ol>
                                </>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-outline-dark" onClick={handleCFLink}>
                                Link Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default LinkCodeforcesAccount;
