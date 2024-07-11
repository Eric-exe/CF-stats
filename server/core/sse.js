const SSE = {
    userConnections: {},
    sendUsernameUpdate(username, message) {
        if (Object.prototype.hasOwnProperty.call(this.userConnections, username)) {
            for (const client of this.userConnections[username]) {
                client.write("data: " + JSON.stringify(message) + "\n\n");
            }
        }
    },
    addUserClient(username, client) {
        if (!this.userConnections[username]) {
            this.userConnections[username] = [];
        }
        this.userConnections[username].push(client);
    },
    removeUserClient(username, client) {
        this.userConnections[username] = this.userConnections[username].filter((conn) => conn !== client);
    },
};

module.exports = SSE;