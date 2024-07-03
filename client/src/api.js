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

    static getPersonalUserInfo(JWT) {
        return this.fetchRequest(import.meta.env.VITE_DB_URL + "/user/personalInfo", "GET", "", JWT);
    }

    static getPublicUserInfo(username) {
        return this.fetchRequest(import.meta.env.VITE_DB_URL + "/user/publicInfo", "POST", JSON.stringify({ username }), "");
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
}

export default API;
