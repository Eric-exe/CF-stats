import "./App.css";
import { useState, useEffect } from "react";
import GitHubOAuth from "./components/GitHubOAuth";
import API from './api.js'

function App() {
    const [JWT, setJWT] = useState(null);
    const [userInfo, setUserInfo] = useState({});

    // load JWT from local storage if it exists
    useEffect(() => {
        const localJWT = localStorage.getItem("jwt");
        if (localJWT === null) {
            return;
        }
        setJWT(localJWT);
    }, []);

    // gets user data from JWT. JWT can expire so remove local JWT if it is expired.
    useEffect(() => {
        const updateUserInfo = async () => {
            const data = await API.getUserInfo(JWT).then(response => response.json());
            if (Object.prototype.hasOwnProperty.call(data, "error")) {
                localStorage.removeItem("jwt"); // bad JWT, clear jwt from localStorage
            }
            else {
                setUserInfo(data);
            }
        }

        if (JWT != null) {
            updateUserInfo();
        }
    }, [JWT]);

    return (
        <>
            {
                JSON.stringify(userInfo) == "{}" ? 
                <GitHubOAuth JWTSetter={setJWT}/>
                :
                <p>{JSON.stringify(userInfo)}</p>
            }
        </>
    );
}

export default App;
