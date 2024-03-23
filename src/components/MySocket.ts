import {io} from "socket.io-client";

class Mysocket {
	public socket: any;
	public URL: string;
	private onDataChange: (users: string[]) => void = () => {};
	public users: any[] = [];
	public selectedUser: any = null;

	constructor() {
		this.URL = "http://localhost:8080";
		this.socket = io(this.URL, {autoConnect: false});
		this.socket.onAny((event: any, ...args: any) => {
			console.log(event, args);
		});

		this.socket.on("connect_error", (err: any) => {
			if (err.message === "invalid username") console.log("++++", err);
		});

		this.socket.on("users", (users: any) => {
			users.forEach((user: any) => {
				user.self = user.userID === this.socket.userID;
			});

			this.users = users;
			this.onDataChange(this.users);
		});

		this.socket.on("user connected", (userData: any) => {
			//If user is already exists in the users array, then set the connected property to true
			let isUserAlreadyExist = false;
			for (let i = 0; i < this.users.length; i++) {
				const user = this.users[i];
				if (user.userID === userData.userID) {
					user.connected = true;
					isUserAlreadyExist = true;
					break;
				}
			}
			if (!isUserAlreadyExist) {
				this.users.push(userData);
			}
			this.onDataChange(this.users);
		});

		this.socket.on("private message", ({content, from}: any) => {
			for (let i = 0; i < this.users.length; i++) {
				const user = this.users[i];
				if (!user.messages) {
					user["messages"] = [];
				}
				if (user.userID === from) {
					user.messages.push({
						content,
						fromSelf: false,
					});
					if (user !== this.selectedUser) {
						user.hasNewMessages = true;
					}
					break;
				}
			}
			this.onDataChange(this.users);
		});

		this.socket.on("connect", () => {
			this.users.forEach((user) => {
				if (user.self) {
					user.connected = true;
				}
			});
		});

		this.socket.on("user disconnected", (userID: string) => {
			this.users.forEach((user) => {
				if (user.userID === userID) {
					user.connected = false;
				}
			});
			this.onDataChange(this.users);
		});

		this.socket.on("session", ({sessionID, userID}: any) => {
			// attach the session ID to the next reconnection attempts
			this.socket.auth = {sessionID};
			// store it in the localStorage
			localStorage.setItem("sessionID", sessionID);
			// save the ID of the user
			this.socket.userID = userID;
		});
	}

	onUsernameSelection(username: string) {
		this.socket.auth = {username};
		//Manually connecting the socket when user clicks on send/join button
		this.socket.connect();
	}

	setUserDataChange(callback: (users: string[]) => void) {
		this.onDataChange = callback;
	}

	setSelectedUser(userID: string) {
		const user = this.users.find((user) => user.userID === userID);
		this.selectedUser = user;
	}

	onMessage(content: string) {
		if (this.selectedUser) {
			this.socket.emit("private message", {
				content,
				to: this.selectedUser.userID,
				from: this.socket.userID,
			});
			//check
			if (this.selectedUser && !this.selectedUser.messages) {
				this.selectedUser["messages"] = [];
			}
			this.selectedUser.messages.push({
				content,
				fromSelf: true,
			});
		}
		this.onDataChange(this.users);
	}

	connectToSocketSession(sessionID: string) {
		this.socket.auth = {sessionID};
		this.socket.connect();
	}
}

export default Mysocket;

// //variables

// const URL = "http://localhost:8080";
// const socket = io(URL, {autoConnect: false});
// socket.onAny((event, ...args) => {
// 	console.log(event, args);
// });
// let users = [];

// //handling server side events body
// // this event is send from server middleware check if it is the username
// socket.on("connect_error", (err) => {
// 	if (err.message === "invalid username") {
// 		//   usernameAlreadySelected = false;
// 		console.log("++++++++++", err);
// 	}
// });

// //this event is catch the user data coming from server side
// socket.on("users", (serverUsers: any) => {
// 	serverUsers.forEach((user: any) => {
// 		user.self = user.userID === socket.id;
// 	});
// 	// put the current user first, and then sort by username
// 	// users = users.sort((a: any, b: any) => {
// 	// 	if (a.self) return -1;
// 	// 	if (b.self) return 1;
// 	// 	if (a.username < b.username) return -1;
// 	// 	return a.username > b.username ? 1 : 0;
// 	// });
// 	users = serverUsers;
// });

// socket.on("user connected", (user) => {
// 	users.push(user);
// });

// // function body
// export const onUsernameSelection = (username: string) => {
// 	// let usernameAlreadySelected = true;
// 	socket.auth = {username};
// 	socket.connect();
// };

// export const setUserDataChange = (callback: (users: string[]) => void) => {
// 	socket.on("users", (serverUsers: any) => {
// 		callback(serverUsers);
// 	});
// };

// export default socket;
