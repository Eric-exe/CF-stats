import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GitHubOAuth from "./GitHubOAuth.jsx";
import propTypes from "prop-types";

NavBar.propTypes = {
    JWTSetter: propTypes.func.isRequired,
    userInfo: propTypes.object.isRequired,
};
function NavBar(props) {
    const [currentPage, setCurrentPage] = useState("/");

    const handleNavLinkClick = (page) => {
        setCurrentPage(page);
        navigate(page);
    };

    const navigate = useNavigate();

    return (
        <div className="navbar navbar-expand-lg sticky-top navbar-dark bg-dark shadow-lg">
            <div className="container-fluid">
                <div className="navbar-brand">
                    <i className="bi bi-code-slash mx-2"></i>
                    CProgAggregator
                </div>

                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbar">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbar">
                    <div className="navbar-nav me-auto">
                        <div className="nav-item">
                            <div className={"nav-link " + (currentPage === "/" ? "active" : "")} onClick={() => handleNavLinkClick("/")}>
                                Home
                            </div>
                        </div>

                        <div className="nav-item">
                            <div
                                className={"nav-link " + (currentPage === "/problems" ? "active" : "")}
                                onClick={() => handleNavLinkClick("/problems")}
                            >
                                Problems
                            </div>
                        </div>

                        <div className="nav-item">
                            <div
                                className={"nav-link " + (currentPage === "/resources" ? "active" : "")}
                                onClick={() => handleNavLinkClick("/resources")}
                            >
                                Resources
                            </div>
                        </div>
                    </div>

                    <div className="navbar-nav nav-item">
                        <div
                            className={"nav-link " + (currentPage.substring(0, 8) === "/profile" ? "active" : "")}
                            onClick={() => handleNavLinkClick(`/profile/${props.userInfo.username}`)}
                        >
                            {JSON.stringify(props.userInfo) === "{}" ? (
                                <GitHubOAuth JWTSetter={props.JWTSetter} />
                            ) : (
                                <>{props.userInfo.username}</>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NavBar;
