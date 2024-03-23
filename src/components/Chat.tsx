"use client";
import React, {useCallback, useEffect, useState} from "react";
import Mysocket from "../components/MySocket";

const socket = new Mysocket();

const Chat = () => {
	const [chatScreen, setChatScreen] = useState(false);
	const [userName, setUserName] = useState("");
	const [users, setUsers] = useState([]);
	const [message, setMessage] = useState("");
	const [selectedUser, setSelectedUser] = useState<any>();

	const handleUserChange = useCallback((data: any) => {
		setUsers([...data] as any);
	}, []);

	useEffect(() => {
		// const callback = (data: any) => {
		// 	setUsers([...data] as any);
		// };
		socket.setUserDataChange(handleUserChange);
	}, [handleUserChange]);

	useEffect(() => {
		const sessionID = localStorage.getItem("sessionID");
		if (sessionID) {
			socket.connectToSocketSession(sessionID);
			setChatScreen(true);
		}
	}, []);

	useEffect(() => {
		if (selectedUser) socket.setSelectedUser(selectedUser.userID);
	}, [selectedUser]);

	return (
		<>
			{!chatScreen ? (
				<div className="h-screen">
					<div className="flex justify-center h-full items-center">
						<input
							type="text"
							onChange={(event) => setUserName(event.target.value)}
							placeholder="Enter Your Name"
							className=" border placeholder:p-4 h-10 p-4"
						/>
						<button
							onClick={() => {
								setChatScreen(true);
								socket.onUsernameSelection(userName);
							}}
							className="h-10 w-20 bg-purple-600 text-white font-medium"
						>
							join
						</button>
					</div>
				</div>
			) : (
				<div className="grid grid-flow-col h-screen">
					<section className="bg-purple-700">
						{users &&
							users.map((user: any, index) => {
								return (
									<>
										<button
											className={`${
												selectedUser && selectedUser.userID === user.userID && "bg-purple-800"
											} flex flex-col items-start w-full gap-10 p-4`}
											key={index}
											onClick={() => setSelectedUser(user)}
										>
											<div className="flex flex-col">
												<div className="text-xl font-bold text-white">
													{user.username} {user.self && "(MySelf)"}
												</div>
												<div className="flex items-center gap-2 justify-start text-sm">
													<div className="bg-green-400 h-2 w-2 rounded"></div>
													<div className="text-gray-300">online</div>
												</div>
											</div>
										</button>

										{user.hasNewMessages && (
											<div className="bg-red-500 h-4 w-4 rounded self-center"></div>
										)}
									</>
								);
							})}
					</section>

					<section className="col-span-6 relative">
						{/* chating header section */}
						<div className="pl-5 py-6 border-b-2">
							<div className="flex items-center gap-2">
								<div className="bg-green-400 h-2 w-2 rounded"></div>
								<div className=" font-bold">
									{selectedUser && <div>{selectedUser.username}</div>}
								</div>
							</div>
						</div>
						{/* ongoing chating section */}
						<div className="p-6">
							{selectedUser &&
								users &&
								users.map((user: any) => {
									if (user.userID === selectedUser.userID) {
										return (
											<div key={user.userID}>
												{user.messages &&
													user.messages.map((message: any, index: number) => {
														return (
															<div
																key={index}
																className={`${
																	message.fromSelf ? "items-start" : "items-end"
																} flex flex-col`}
															>
																<div
																	className={`flex gap-4 font-semibold ${
																		message.fromSelf ? " text-green-600" : " text-red-600"
																	}`}
																>
																	{message.fromSelf ? "(MySelf)" : selectedUser.username}
																</div>
																<div>{message.content}</div>
															</div>
														);
													})}
											</div>
										);
									}
								})}
						</div>

						{/* Message Box section */}
						<div className="flex gap-2 p-6 absolute bottom-0 w-full">
							<textarea
								value={message}
								onChange={(event) => setMessage(event.target.value)}
								className="w-full h-24 border-solid bg-gray-200 rounded p-4"
								placeholder="your message...."
							></textarea>
							<button
								onClick={() => {
									socket.onMessage(message);
									setMessage("");
								}}
								className="bg-purple-700 h-24 w-[100px] rounded text-white text-xl"
							>
								send
							</button>
						</div>
					</section>
				</div>
			)}
		</>
	);
};

export default Chat;
