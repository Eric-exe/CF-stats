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
        return this.fetchRequest(import.meta.env.VITE_DB_URL + "/user/createJWT", "POST", JSON.stringify({ code }), "");
    }

    static getOrCreateUserInfo(JWT) {
        return this.fetchRequest(import.meta.env.VITE_DB_URL + "/user/getOrCreateInfo", "GET", "", JWT);
    }
    static getUserInfo(username) {
        return this.fetchRequest(import.meta.env.VITE_DB_URL + "/user/getInfo", "POST", JSON.stringify({ username }), "");
    }

    static updateUserInfo(username) {
        return this.fetchRequest(import.meta.env.VITE_DB_URL + "/user/updateInfo", "POST", JSON.stringify({ username }), "");
    }

    static getCFLinkKey(JWT) {
        return this.fetchRequest(import.meta.env.VITE_DB_URL + "/user/keygen", "GET", "", JWT);
    }

    static linkCF(handle, JWT) {
        return this.fetchRequest(import.meta.env.VITE_DB_URL + "/user/linkCF", "POST", JSON.stringify({ handle }), JWT);
    }

    static updateDifficultyRating(JWT, problemId, newDifficultyRating) {
        return this.fetchRequest(import.meta.env.VITE_DB_URL + "/user/updateDifficultyRating", "POST", JSON.stringify({ problemId, newDifficultyRating }), JWT);
    }

    static generatedSuggestedProblem(JWT, ratingStart, ratingEnd, tags) {
        return this.fetchRequest(import.meta.env.VITE_DB_URL + "/user/generateSuggestedProblem", "POST", JSON.stringify({ ratingStart, ratingEnd, tags }), JWT);
    }

    static getProblemsData() {
        return this.fetchRequest(import.meta.env.VITE_DB_URL + "/problems/getData", "GET", "", "");
    }
}

export default API;
