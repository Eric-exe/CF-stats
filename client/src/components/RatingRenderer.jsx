function RatingRenderer(params) {
    if (params.data.rating === -1) return <></>;
    return params.data.rating;
}

export default RatingRenderer;