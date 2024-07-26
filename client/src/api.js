class API {
    static fetchRequest(url, method, body, JWT) {
        try {
            let fetchInput = {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + JWT,
                },
            };

            if (fetchInput["method"] != "GET") {
                fetchInput["body"] = body;
            }

            return fetch(url, fetchInput);
        } catch (error) {
            console.error(error);
        }
    }

    static createJWT(code) {
        return this.fetchRequest(import.meta.env.VITE_BACKEND_URL + "/user/createJWT", "POST", JSON.stringify({ code }), "");
    }

    static getOrCreateUserInfo(JWT) {
        return this.fetchRequest(import.meta.env.VITE_BACKEND_URL + "/user/getOrCreateInfo", "GET", "", JWT);
    }
    static getUserInfo(username) {
        return this.fetchRequest(import.meta.env.VITE_BACKEND_URL + "/user/getInfo", "POST", JSON.stringify({ username }), "");
    }

    static updateUserInfo(username) {
        return this.fetchRequest(import.meta.env.VITE_BACKEND_URL + "/user/updateInfo", "POST", JSON.stringify({ username }), "");
    }

    static getCFLinkKey(JWT) {
        return this.fetchRequest(import.meta.env.VITE_BACKEND_URL + "/user/keygen", "GET", "", JWT);
    }

    static linkCF(handle, JWT) {
        return this.fetchRequest(import.meta.env.VITE_BACKEND_URL + "/user/linkCF", "POST", JSON.stringify({ handle }), JWT);
    }

    static updateDifficultyRating(JWT, problemId, newDifficultyRating) {
        return this.fetchRequest(import.meta.env.VITE_BACKEND_URL + "/user/updateDifficultyRating", "POST", JSON.stringify({ problemId, newDifficultyRating }), JWT);
    }

    static generatedSuggestedProblem(JWT, ratingStart, ratingEnd, tags) {
        return this.fetchRequest(import.meta.env.VITE_BACKEND_URL + "/user/generateSuggestedProblem", "POST", JSON.stringify({ ratingStart, ratingEnd, tags }), JWT);
    }

    static getProblemsData() {
        return this.fetchRequest(import.meta.env.VITE_BACKEND_URL + "/problems/getData", "GET", "", "");
    }

    static getPosts(title, tags, sortBy) {
        return this.fetchRequest(import.meta.env.VITE_BACKEND_URL + "/posts/get", "POST", JSON.stringify({ title, tags, sortBy }), "");
    }

    static createPost(JWT, title, body, tags) {
        return this.fetchRequest(import.meta.env.VITE_BACKEND_URL + "/posts/create", "POST", JSON.stringify({ title, body, tags }), JWT);
    }

    static updatePostVotes(JWT, id, voteType) {
        return this.fetchRequest(import.meta.env.VITE_BACKEND_URL + "/posts/vote", "POST", JSON.stringify({ id, voteType }), JWT);
    }

    static getPersonalPosts(JWT) {
        return this.fetchRequest(import.meta.env.VITE_BACKEND_URL + "/posts/me", "GET", "", JWT);
    }

    static deletePost(JWT, id) {
        return this.fetchRequest(import.meta.env.VITE_BACKEND_URL + "/posts/delete", "POST", JSON.stringify({ id }), JWT);
    }

    static getContestsData() {
        return this.fetchRequest(import.meta.env.VITE_BACKEND_URL + "/contests/data", "GET", "", "");
    }

    static getMetadata() {
        return this.fetchRequest(import.meta.env.VITE_BACKEND_URL + "/problems/getMetadata", "GET", "", "");
    }
}

export default API;
