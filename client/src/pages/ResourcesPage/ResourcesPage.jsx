import { useState } from "react";
import ResourcesBar from "./ResourcesBar";
import Post from "./Post";
import propTypes from "prop-types";

ResourcesPage.propTypes = {
    userInfo: propTypes.object.isRequired,
    JWT: propTypes.string.isRequired,
    JWTSetter: propTypes.func.isRequired,
};

function ResourcesPage(props) {
    const [postsData, setPostsData] = useState([]);

    return (
        <div className="container-fluid">
            <ResourcesBar
                isLoggedIn={JSON.stringify(props.userInfo) !== "{}"}
                JWT={props.JWT}
                JWTSetter={props.JWTSetter}
                postsSetter={setPostsData}
            />

            <div className="card card-body m-4 shadow">
                <div className="accordion accordion-flush" id="posts-accordion">
                    {postsData.map((data, index) => (
                        <Post
                            key={index}
                            userInfo={props.userInfo}
                            data={data}
                            postsSetter={setPostsData}
                            JWT={props.JWT}
                            JWTSetter={props.JWTSetter}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ResourcesPage;
