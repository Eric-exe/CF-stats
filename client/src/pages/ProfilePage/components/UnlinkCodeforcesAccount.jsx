import { useState } from "react";
import API from "../../../api";
import propTypes from "prop-types";

UnlinkCodeforcesAccount.propTypes = {
    JWT: propTypes.string.isRequired,
    JWTSetter: propTypes.func.isRequired,
};

function UnlinkCodeforcesAccount(props) {
    const [statusMsg, setStatusMsg] = useState("");
    const handleUnlink = async () => {
        const response = await API.unlinkHandle(props.JWT).then((response) => response.json());
        if (Object.prototype.hasOwnProperty.call(response, "JWT Error")) {
            props.JWTSetter("");
        }

        if (response.status === "OK") {
            const modalInstance = bootstrap.Modal.getInstance(document.getElementById("unlinkModal"));
            if (modalInstance) {
                modalInstance.hide();
            }
        } else {
            setStatusMsg("Unlinking failed");
        }
    };

    return (
        <>
            <button
                className="btn btn-sm btn-outline-dark"
                id="profilePageHandleUnlink"
                data-bs-toggle="modal"
                data-bs-target="#unlinkModal"
            >
                Unlink
            </button>

            <div className="modal fade" id="unlinkModal" tabIndex="-1">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5">Unlink Codeforces Account</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="text-danger">{statusMsg}</div>
                            Are you sure you want to do this?
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-sm btn-outline-danger" data-bs-dismiss="modal">
                                No
                            </button>
                            <button type="button" className="btn btn-sm btn-outline-success" onClick={handleUnlink}>
                                Yes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default UnlinkCodeforcesAccount;
