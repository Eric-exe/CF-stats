import propTypes from "prop-types";

HomePage.propTypes = {
    userInfo: propTypes.object.isRequired,
};

function HomePage(props) {
    return (
        <>
            <div className="card card-body shadow m-4">
                Hello {props.userInfo.username}!
            </div>
        </>
    );
}

export default HomePage;