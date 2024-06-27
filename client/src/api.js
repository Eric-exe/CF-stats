class API {
    static fetchRequest(url, method, body, JWT) {
        try {
            let fetchInput = {
                "method": method,
                "headers": {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + JWT
                },
            };

            if (fetchInput["method"] != "GET") {
                fetchInput["body"] = body;
            }

            return fetch(url, fetchInput);
        }
        catch (error) {
            console.error(error);
        }
    }

    static createJWT(code) {
        return this.fetchRequest(
            import.meta.env.VITE_DB_URL + "/user/createJWT",
            "POST",
            JSON.stringify({ code }),
            () => {},
            false
        )
    }

    static getUserInfo(userInfoSetter, JWT) {
        return this.fetchRequest(
            import.meta.env.VITE_DB_URL + "/user/info",
            "GET",
            "",
            userInfoSetter,
            false,
            JWT
        )
    }
}

export default API;