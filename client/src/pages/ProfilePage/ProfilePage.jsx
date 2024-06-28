import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import propTypes from "prop-types";
import API from "../../api";

ProfilePage.propTypes = {
    userInfo: propTypes.object.isRequired,
};

function ProfilePage(props) {
    const { profileUsername } = useParams();
    const [mode, setMode] = useState("viewer");
    const [profileInfo, setProfileInfo] = useState({});

    useEffect(() => {
        // update modes when username is updated
        if (props.userInfo.username === profileUsername) {
            setMode("owner");
            setProfileInfo(props.userInfo); // user info stores all private info
        } else {
            setMode("viewer");
            setProfileInfo(API.getPublicUserInfo(profileUsername));
        }
        setMode(props.userInfo.username === profileUsername ? "owner" : "viewer");
    }, [props.userInfo.username, profileUsername]);

    return (
        <div className="profile-page row justify-content-center container-fluid">
            <div className="col-12">
                {/* General user stat bar */}
                <div className="card card-body shadow m-4">
                    <div className="row">
                        <div className="d-flex col-md-3 my-auto">
                            <b>Username:&nbsp;</b> {profileInfo.username}
                        </div>
                        <div className="d-flex col-md-3 my-auto">
                            <b>Codeforces Handle:&nbsp;</b> {profileInfo.handle}
                        </div>
                        <div className="d-flex col-md-3 my-auto">
                            <b>Estimated Elo:&nbsp;</b> {profileInfo.estimatedElo}
                        </div>
                        <div className="d-flex col-md-3 justify-content-between">
                            <div className="my-auto">
                                <b>Last updated:&nbsp;</b> {-1}
                            </div>
                            <div className="my-auto">
                                <button className="btn btn-sm btn-outline-dark">
                                    <i className="bi bi-arrow-clockwise"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Questions stats */}
                <div className="card shadow m-4">
                    <div className="card-header" data-bs-toggle="collapse" data-bs-target="#problem-stats-body" role="button">
                        <b>Problem Stats</b>
                    </div>
                    <div className="collapse show" id="problem-stats-body">
                        <div className="container-fluid">
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-4">
                                        Problems attempted:&nbsp; {-1} <br />
                                        Problems solved:&nbsp; {-1} <br />
                                        Submissions:&nbsp; {-1} <br />
                                        <hr />
                                        Most common topics:
                                    </div>

                                    <div className="col-md-4">Your Problems:</div>

                                    <div className="col-md-4">Problems in your Elo Range:</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activity stats */}
                <div className="m-4">
                    <div className="row">
                        <div className="col-6">
                            <div className="card shadow">
                                <div className="card-header">
                                    <b>Submissions Activity</b>
                                </div>
                            </div>
                        </div>

                        <div className="col-6">
                            <div className="card shadow">
                                <div className="card-header">
                                    <b>Problems AC'ed Activity</b>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Debugging stuff */}
            This is the profile page of {profileUsername}. <br />
            You are: {mode}
            <br />
            {JSON.stringify(props.userInfo)}
            <br />
            {JSON.stringify(profileInfo)}
        </div>
    );
}

export default ProfilePage;
