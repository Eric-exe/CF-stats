import propTypes from "prop-types";

SortableTableHeader.propTypes = {
    name: propTypes.string.isRequired,
    sortBy: propTypes.string.isRequired,
    sortBySetter: propTypes.func.isRequired,
    sortMode: propTypes.string.isRequired,
    sortModeSetter: propTypes.func.isRequired,
}

function SortableTableHeader(props) {
    const handleHeaderClick = () => {
        if (props.sortBy !== props.name) {
            props.sortBySetter(props.name);
            props.sortModeSetter("desc");
        }
        else {
            // alternate between asc/desc/none
            if (props.sortMode === "desc") {
                props.sortModeSetter("asc");
            }
            else if (props.sortMode === "asc") {
                props.sortModeSetter("none");
            }
            else {
                props.sortModeSetter("desc");
            }
        }
    }

    return (
        <th scope="col">
            <div className="d-flex text-nowrap justify-content-between hoverable" onClick={handleHeaderClick}>
                {props.name}
                {
                    props.sortBy !== props.name || props.sortMode === "none" ? 
                    <i className="bi bi-dash-lg"></i> :
                    <i className={"bi " + (props.sortMode === "asc" ? "bi-caret-up-fill" : "bi-caret-down-fill")}></i>
                }
            </div>
        </th>
    );
}

export default SortableTableHeader;
