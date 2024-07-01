import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import propTypes from "prop-types";
import API from "../../api";
import SuggestedProblemCard from "./components/SuggestedProblemCard";
import QuestionStatsCard from "./components/QuestionStatsCard";
import ActivityGraphStatsCard from "./components/ActivityGraphStatsCard";
import SubmissionsStatsCard from "./components/SubmissionsStatsCard";

ProfilePage.propTypes = {
    userInfo: propTypes.object.isRequired,
};

function ProfilePage(props) {
    const { profileUsername } = useParams();
    const [mode, setMode] = useState("viewer");
    const [profileInfo, setProfileInfo] = useState(null);
    const [statusMsg, setStatusMsg] = useState("Loading...");

    // update modes when username is updated
    useEffect(() => {
        const updateProfileInfo = async () => {
            if (props.userInfo.username === profileUsername) {
                setMode("owner");
                setProfileInfo(props.userInfo); // user info stores all private info
            } else {
                setMode("viewer");
                setProfileInfo(await API.getPublicUserInfo(profileUsername).then(response => response.json()));
                setStatusMsg("No user found"); // will only show if profile info is null
            }
            setMode(props.userInfo.username === profileUsername ? "owner" : "viewer");
            console.log(profileInfo);
        }
        updateProfileInfo();
    }, [props.userInfo.username, profileUsername]);

    return (
        <>
            {profileInfo === null ? (
                <p>{statusMsg}</p>
            ) : (
                <div className="profile-page row justify-content-center container-fluid">
                    <div className="col-12">
                        {/* General user stat bar */}
                        <div className="card card-body shadow m-4">
                            <div className="row">
                                <div className="d-flex col-md-3 my-auto">
                                    <b>Username:&nbsp;</b>{profileInfo.username}
                                </div>
                                <div className="d-flex col-md-3 my-auto">
                                    <b>Codeforces Handle:&nbsp;</b>{profileInfo.handle}
                                </div>
                                <div className="d-flex col-md-3 my-auto">
                                    <b>Estimated Elo:&nbsp;</b>{profileInfo.estimatedElo}
                                </div>
                                <div className="d-flex col-md-3 justify-content-between">
                                    <div className="my-auto">
                                        <b>Last updated:&nbsp;</b>{new Date(profileInfo.lastUpdated).toLocaleString()}
                                    </div>
                                    <div className="my-auto">
                                        <button className="btn btn-sm btn-outline-dark">
                                            <i className="bi bi-arrow-clockwise"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <SuggestedProblemCard />

                        <QuestionStatsCard />

                        <div className="m-4">
                            <div className="row">
                                <div className="col-6">
                                    <ActivityGraphStatsCard title="Submissions Activity" id="submisisons-activity-card" />
                                </div>

                                <div className="col-6">
                                    <ActivityGraphStatsCard title="Problems Solved Activity" id="problems-solved-activity-card" />
                                </div>
                            </div>
                        </div>

                        <SubmissionsStatsCard submissionsInfo={profileInfo.submissions}/>
                    </div>
                </div>
            )}
        </>
    );
}

export default ProfilePage;
