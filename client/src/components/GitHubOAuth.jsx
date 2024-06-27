import { useEffect } from "react";
import API from "../api.js"
import propTypes from "prop-types";

GitHubOAuth.propTypes = {
    JWTSetter: propTypes.func.isRequired,
}

function GitHubOAuth(props) {
    const handleLogin = () => {
        window.location.href = `https://github.com/login/oauth/authorize?client_id=${import.meta.env.VITE_GITHUB_CLIENT_ID}&redirect_uri=${import.meta.env.VITE_GITHUB_CALLBACK_URL}`
    }

    // GitHub OAuth - callback function
    useEffect(() => {
        const handleGitHubCallback = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get("code");
            if (code) {
                const JWT = await API.createJWT(code).then(response => response.json());
                props.JWTSetter(JWT["encoded"]);
                localStorage.setItem("jwt", JWT["encoded"]);
                window.location.href = "/";
            }
        }
        handleGitHubCallback();
    }, []);

    return (
        <button onClick={handleLogin}>Login with GitHub</button>
    )
}

export default GitHubOAuth;
