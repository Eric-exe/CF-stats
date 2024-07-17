import "./App.css";
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar.jsx";
import API from "./api.js";
import HomePage from "./pages/HomePage/HomePage.jsx";
import ProblemsPage from "./pages/ProblemsPage/ProblemsPage.jsx";
import ResourcesPage from "./pages/ResourcesPage/ResourcesPage.jsx";
import ProfilePage from "./pages/ProfilePage/ProfilePage.jsx";
import GitHubOAuthCallbackPage from "./pages/GitHubOAuthCallbackPage/GitHubOAuthCallbackPage.jsx";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

function App() {
    const [JWT, setJWT] = useState("");
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
            const data = await API.getOrCreateUserInfo(JWT).then((response) => response.json());
            if (Object.prototype.hasOwnProperty.call(data, "JWT Error")) {
                localStorage.removeItem("jwt"); // bad JWT, clear jwt from localStorage
                setJWT("");
            } else {
                setUserInfo(data);
            }
        };

        if (JWT !== "") {
            updateUserInfo();
        } else {
            setUserInfo({});
        }
    }, [JWT]);

    return (
        <>
            <Router>
                <NavBar userInfo={userInfo} />
                <Routes>
                    <Route index element={<HomePage />} />
                    <Route path="problems" element={<ProblemsPage userInfo={userInfo} />} />
                    <Route path="resources" element={<ResourcesPage userInfo={userInfo} JWT={JWT} JWTSetter={setJWT} />} />
                    <Route
                        path="profile/:profileUsername"
                        element={<ProfilePage userInfo={userInfo} userInfoSetter={setUserInfo} JWT={JWT} JWTSetter={setJWT} />}
                    />
                    <Route path="auth/github/callback" element={<GitHubOAuthCallbackPage JWTSetter={setJWT} />} />
                </Routes>
            </Router>
        </>
    );
}

export default App;
