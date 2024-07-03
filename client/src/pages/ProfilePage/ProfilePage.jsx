import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import propTypes from "prop-types";
import API from "../../api";
import LinkCodeforcesAccount from "./components/LinkCodeforcesAccount";
import SuggestedProblemCard from "./components/SuggestedProblemCard";
import ProblemStatsCard from "./components/ProblemStatsCard";
import ActivityGraphStatsCard from "./components/ActivityGraphStatsCard";
import SubmissionsStatsCard from "./components/SubmissionsStatsCard";

ProfilePage.propTypes = {
    userInfo: propTypes.object.isRequired,
    JWT: propTypes.string.isRequired,
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
                // setMode("owner");
                setProfileInfo(props.userInfo); // user info stores all private info
            } else {
                setMode("viewer");
                setProfileInfo(await API.getPublicUserInfo(profileUsername).then((response) => response.json()));
                setStatusMsg("No user found"); // will only show if profile info is null
            }
            setMode(props.userInfo.username === profileUsername ? "owner" : "viewer");
        };
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
                        <div className="card card-body shadow m-4 overflow-auto">
                            <div className="row">
                                <div className="d-flex col-lg-3 my-auto flex-wrap">
                                    <b>Username:&nbsp;</b>
                                    {profileInfo.username}
                                </div>
                                <div className="d-flex col-lg-3 my-auto flex-wrap">
                                    {/* Display username or link button if it doesn't exist and user is owner */}
                                    <b className="text-nowrap my-auto">Codeforces Handle:&nbsp;</b>
                                    {
                                        profileInfo.handle !== null ?
                                        <>{profileInfo.handle}</>:
                                        (
                                            mode == "owner" ?
                                            <LinkCodeforcesAccount JWT={props.JWT} profileInfoSetter={setProfileInfo}/> :
                                            <></>
                                        )
                                    }
                                    
                                </div>
                                <div className="d-flex col-lg-3 flex-wrap my-auto">
                                    <b className="text-nowrap">Estimated Rating:&nbsp;</b>
                                    {profileInfo.handle === null ? "" : profileInfo.estimatedRating}
                                </div>
                                <div className="d-flex col-lg-3 justify-content-between">
                                    <div className="d-flex my-auto flex-wrap">
                                        <b className="text-nowrap">Last updated:&nbsp;</b>
                                        {new Date(profileInfo.lastUpdated).toLocaleString()}
                                    </div>
                                    <div className="my-auto">
                                        <button className="btn btn-sm btn-outline-dark">
                                            <i className="bi bi-arrow-clockwise"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {profileInfo.handle === null ? (
                            <p className="text-center">User has not linked their Codeforces account</p>
                        ) : (
                            <>
                                <SuggestedProblemCard />

                                <ProblemStatsCard profileInfo={profileInfo} />

                                <div className="m-4">
                                    <div className="row">
                                        <div className="col-6">
                                            <ActivityGraphStatsCard
                                                title="Submissions Activity"
                                                id="submisisons-activity-card"
                                                activityArray={profileInfo.recentSubmissions}
                                            />
                                        </div>

                                        <div className="col-6">
                                            <ActivityGraphStatsCard
                                                title="Problems Solved Activity"
                                                id="problems-solved-activity-card"
                                                activityArray={profileInfo.recentAC}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <SubmissionsStatsCard profileInfo={profileInfo} />
                            </>
                        )}
                    </div>

                    {JSON.stringify(profileInfo)}
                </div>
            )}
        </>
    );
}

export default ProfilePage;
