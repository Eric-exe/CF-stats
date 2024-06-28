import "./App.css";
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar.jsx";
import API from "./api.js";
import HomePage from "./pages/HomePage/HomePage.jsx";
import ProblemsPage from "./pages/ProblemsPage/ProblemsPage.jsx";
import ResourcesPage from "./pages/ResourcesPage/ResourcesPage.jsx";
import ProfilePage from "./pages/ProfilePage/ProfilePage.jsx";

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
            const data = await API.getPrivateUserInfo(JWT).then(response => response.json());
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
            <Router>
                <NavBar JWTSetter={setJWT} userInfo={userInfo}/>
                <Routes>
                    <Route index element={<HomePage/>}/>
                    <Route path="problems" element={<ProblemsPage/>}/>
                    <Route path="resources" element={<ResourcesPage/>}/>
                    <Route path="profile/:profileUsername" element={<ProfilePage userInfo={userInfo}/>}/>
                </Routes>
            </Router>
        </>
    );
}

export default App;
