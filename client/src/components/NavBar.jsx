import GitHubOAuth from "./GitHubOAuth";
import propTypes from "prop-types";

NavBar.propTypes = {
    JWTSetter: propTypes.func.isRequired,
    userInfo: propTypes.object.isRequired,
};
function NavBar(props) {
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
                            <a className="nav-link active" href="#">
                                Home
                            </a>
                        </div>

                        <div className="nav-item">
                            <a className="nav-link" href="#">
                                Problems
                            </a>
                        </div>

                        <div className="nav-item">
                            <a className="nav-link" href="#">
                                Resources
                            </a>
                        </div>
                    </div>

                    <div className="navbar-nav nav-item">
                        <a className="nav-link" href="#">
                            {JSON.stringify(props.userInfo) === "{}" ? (
                                <GitHubOAuth JWTSetter={props.JWTSetter} />
                            ) : (
                                <>{props.userInfo.username}</>
                            )}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NavBar;
