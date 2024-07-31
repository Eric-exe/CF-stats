import { useState, useEffect } from "react";
import API from "../../../api.js";
import propTypes from "prop-types";

LinkCodeforcesAccount.propTypes = {
    profileUsername: propTypes.string.isRequired,
    JWT: propTypes.string.isRequired,
    linkResponse: propTypes.object.isRequired,
};

function LinkCodeforcesAccount(props) {
    const [status, setStatus] = useState("");
    const [statusIsGood, setStatusIsGood] = useState(true); // determines the color of the status
    const [potentialHandle, setPotentialHandle] = useState("");
    const [key, setKey] = useState("");
    const [isLinking, setIsLinking] = useState(false); // linking visual

    const genKey = async () => {
        const data = await API.getCFLinkKey(props.JWT).then((response) => response.json());
        if (Object.prototype.hasOwnProperty.call(data, "JWT Error")) {
            setStatus(data.error);
            setKey("N/A");
        } else {
            setKey(data["key"]);
        }
    };

    const handleCFLink = () => {
        setIsLinking(true);
        API.linkCF(potentialHandle, props.JWT).then((response) => response.json());
    };

    // handle response
    useEffect(() => {
        if (props.linkResponse) {
            setIsLinking(false);
            if (props.linkResponse.status === "OK") {
                const modalInstance = bootstrap.Modal.getInstance(document.getElementById("cfLinkModal"));
                if (modalInstance) {
                    modalInstance.hide();
                }
                setStatus("");
                setPotentialHandle("");
                API.updateUserInfo(props.profileUsername);
            } else {
                setStatus(props.linkResponse.Error);
                setStatusIsGood(false);
            }
        }
    }, [props.linkResponse]);

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
                                        <div className="col-9 my-auto user-select-all">{key}</div>
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
                            {
                                isLinking ? 
                                <div className="spinner-border spinner-border-sm" role="status"/> :
                                <></>
                            }
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
