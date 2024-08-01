import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import propTypes from "prop-types";
import API from "../../api";
import LinkCodeforcesAccount from "./components/LinkCodeforcesAccount";
import SuggestedProblemCard from "./components/SuggestedProblemCard/SuggestedProblemCard";
import ProblemStatsCard from "./components/ProblemStatsCard/ProblemStatsCard";
import ActivityGraphStatsCard from "./components/ActivityGraphStatsCard/ActivityGraphStatsCard";
import SubmissionsStatsCard from "./components/SubmissionsStatsCard";
import RevisionsCard from "./components/RevisionsCard";
import UnlinkCodeforcesAccount from "./components/UnlinkCodeforcesAccount";

ProfilePage.propTypes = {
    userInfo: propTypes.object.isRequired,
    userInfoSetter: propTypes.func.isRequired,
    JWT: propTypes.string.isRequired,
    JWTSetter: propTypes.func.isRequired,
    metadata: propTypes.object.isRequired,
};

function ProfilePage(props) {
    const { profileUsername } = useParams();
    const [pageMode, setPageMode] = useState("viewer");
    const [profileInfo, setProfileInfo] = useState(null);
    const [generalStatusMsg, setGeneralStatusMsg] = useState("Loading...");

    const [linkResponse, setLinkResponse] = useState({});

    useEffect(() => {
        const updateProfileInfo = async () => {
            if (props.userInfo.username === profileUsername) {
                setPageMode("owner");
                setProfileInfo(props.userInfo); // user info stores all private info
            } else {
                setPageMode("viewer");
                setProfileInfo(await API.getUserInfo(profileUsername).then((response) => response.json()));
                setGeneralStatusMsg("No user found"); // will only show if profile info is null
            }
            setPageMode(props.userInfo.username === profileUsername ? "owner" : "viewer");
        };
        updateProfileInfo();
    }, [profileUsername, props.userInfo]);

    // Use SSEs to always display the latest data in realtime.
    useEffect(() => {
        let sse = new EventSource(`${import.meta.env.VITE_BACKEND_URL}/user/sse/${profileUsername}`);
        sse.onmessage = (e) => {
            getUpdatedData(e);
        };

        sse.onerror = (e) => {
            console.error(e);
            sse.close();
            sse = new EventSource(`${import.meta.env.VITE_BACKEND_URL}/user/sse/${profileUsername}`);
        };

        const getUpdatedData = async (e) => {
            const data = JSON.parse(e.data);

            // general user update response
            if (data.job === "UPDATE_USER") {
                const userData = await API.getUserInfo(profileUsername).then((response) => response.json());
                setProfileInfo(userData);
                if (props.userInfo.username === profileUsername) {
                    props.userInfoSetter(userData);
                }
            }

            // linking response
            if (data.job === "LINK_USER") {
                setLinkResponse(data);
            }
        };

        return () => {
            sse.close();
        };
    }, [profileUsername, props.userInfo.username]);

    const refreshPage = () => {
        API.updateUserInfo(profileUsername);
    };

    return (
        <>
            {profileInfo === null ? (
                <p>{generalStatusMsg}</p>
            ) : (
                <div className="profile-page justify-content-center container-fluid">
                    <div className="row">
                        <div className="col-12">
                            {/* General user stat bar */}
                            <div className="card card-body shadow m-4 overflow-auto">
                                <div className="row">
                                    <div className="d-flex col-xl-3 my-auto flex-wrap text-truncate">
                                        <b>Username:&nbsp;</b>
                                        {profileInfo.username}
                                    </div>
                                    <div className="d-flex col-xl-3 my-auto flex-wrap text-truncate">
                                        {/* Display username or link button if it doesn't exist and user is owner */}
                                        <b className="text-nowrap my-auto">Codeforces Handle:&nbsp;</b>
                                        {profileInfo.handle !== null ? (
                                            <div
                                                className="d-flex justify-content-between align-items-center flex-grow-1 text-truncate"
                                                id="profilePageUserHandle"
                                            >
                                                <div className="text-truncate">{profileInfo.handle}</div>
                                                {pageMode === "owner" ? (
                                                    <UnlinkCodeforcesAccount JWT={props.JWT} JWTSetter={props.JWTSetter} />
                                                ) : (
                                                    <></>
                                                )}
                                            </div>
                                        ) : pageMode === "owner" ? (
                                            <LinkCodeforcesAccount
                                                profileUsername={profileUsername}
                                                JWT={props.JWT}
                                                userInfoSetter={props.userInfoSetter}
                                                profileInfoSetter={setProfileInfo}
                                                linkResponse={linkResponse}
                                                linkResponseSetter={setLinkResponse}
                                            />
                                        ) : (
                                            <></>
                                        )}
                                    </div>
                                    <div className="d-flex col-xl-3 flex-wrap my-auto">
                                        <b className="text-nowrap">Estimated Rating:&nbsp;</b>
                                        {profileInfo.handle === null
                                            ? ""
                                            : String(profileInfo.estimatedRating) + " (" + String(profileInfo.rating) + ")"}
                                    </div>
                                    <div className="d-flex col-xl-3 justify-content-between">
                                        <div className="d-flex my-auto flex-wrap">
                                            <b className="text-nowrap">Last updated:&nbsp;</b>
                                            {profileInfo.handle !== null ? (
                                                <>{new Date(profileInfo.lastUpdated).toLocaleString()}</>
                                            ) : (
                                                <></>
                                            )}
                                        </div>
                                        <div className="my-auto">
                                            {/* Only display refresh button if there is a handle attached */}
                                            {profileInfo.handle !== null ? (
                                                profileInfo.isUpdating ? (
                                                    <button className="btn btn-sm btn-outline-dark">
                                                        <div className="spinner-border spinner-border-sm" role="status"></div>
                                                    </button>
                                                ) : (
                                                    <button className="btn btn-sm btn-outline-dark" onClick={refreshPage}>
                                                        <i className="h6 bi bi-arrow-clockwise"></i>
                                                    </button>
                                                )
                                            ) : (
                                                <></>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {profileInfo.handle === null ? (
                                <p className="text-center">User has not linked their Codeforces account</p>
                            ) : (
                                <>
                                    {pageMode === "owner" ? (
                                        <SuggestedProblemCard
                                            userInfo={props.userInfo}
                                            userInfoSetter={props.userInfoSetter}
                                            JWT={props.JWT}
                                            JWTSetter={props.JWTSetter}
                                        />
                                    ) : (
                                        <></>
                                    )}

                                    <ProblemStatsCard profileInfo={profileInfo} metadata={props.metadata} />

                                    <div className="m-4">
                                        <div className="row">
                                            <div className="col-lg-6">
                                                <ActivityGraphStatsCard
                                                    title="Submissions Activity"
                                                    id="submisisons-activity-card"
                                                    activityArray={profileInfo.recentSubmissions}
                                                />
                                            </div>

                                            <div className="col-lg-6">
                                                <ActivityGraphStatsCard
                                                    title="Problems Solved Activity"
                                                    id="problems-solved-activity-card"
                                                    activityArray={profileInfo.recentAC}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <SubmissionsStatsCard profileInfo={profileInfo} />
                                    {pageMode === "owner" ? (
                                        <RevisionsCard userInfo={props.userInfo} JWT={props.JWT} JWTSetter={props.JWTSetter} />
                                    ) : (
                                        <></>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default ProfilePage;
