import ResourcesBar from "./ResourcesBar";
import Post from "./Post";

const DUMMY_DATA = [
    { id: 1, authorUsername: "Eric-exe", title: "Cool title", body: "HTestestes ests", tags: ["dp", "dfs and similar"], upvotes: [], downvotes: ["A"], timeCreated: "2024-07-15T16:15:32.494Z" },
    { id: 2, authorUsername: "acc2", title: "Cool title2", body: "HTestestes ests hey", tags: ["fft", "dsu"], upvotes: ["HEY"], downvotes: [], timeCreated: "2024-07-15T16:15:32.494Z"},
];
function ResourcesPage() {
    return (
        <div className="container-fluid">
            <ResourcesBar />

            <div className="card card-body m-4 shadow">
                <div className="accordion accordion-flush" id="posts-accordion">
                    {DUMMY_DATA.map((data, index) => (
                        <Post key={index} data={data} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ResourcesPage;
