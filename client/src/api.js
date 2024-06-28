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

    static getPrivateUserInfo(JWT) {
        return this.fetchRequest(import.meta.env.VITE_DB_URL + "/user/privateInfo", "GET", "", JWT);
    }

    static getPublicUserInfo(username) {
        return this.fetchRequest(import.meta.env.VITE_DB_URL + "/user/publicInfo", "POST", JSON.stringify({ username }), "");
    }
}

export default API;
