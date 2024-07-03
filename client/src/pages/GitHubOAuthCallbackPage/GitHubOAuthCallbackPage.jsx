import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import propTypes from "prop-types";
import API from "../../api.js";

GitHubOAuthCallbackPage.propTypes = {
    JWTSetter: propTypes.func.isRequired, 
};

function GitHubOAuthCallbackPage(props) {
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        const code = searchParams.get("code");

        const handleLogin = async (code) => {
            if (code) {
                const JWT = await API.createJWT(code).then(response => response.json());
                props.JWTSetter(JWT.encoded);
                localStorage.setItem("jwt", JWT.encoded);
                window.location.href = "/";
            }
        }  
        handleLogin(code);
    }, []);

    return (<>Logging you in...</>);
}

export default GitHubOAuthCallbackPage;