import Contests from "./Contests";
import propTypes from "prop-types";

HomePage.propTypes = {
    userInfo: propTypes.object.isRequired,
    upcomingContestsData: propTypes.array.isRequired,
    pastContestsData: propTypes.array.isRequired,
};

function HomePage(props) {
    return (
        <>
            <div className="card card-body shadow m-4">
                Hello {props.userInfo.username}!
            </div>

            <Contests title="Current and Upcoming Contests" height="30vh" data={props.upcomingContestsData}/>
            <Contests title="Previous Contests" height="60vh" data={props.pastContestsData}/>
        </>
    );
}

export default HomePage;