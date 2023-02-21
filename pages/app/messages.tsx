import axios from "axios";
import { useState, useEffect, useRef, Dispatch, SetStateAction } from "react";
import Layout from "../../components/layout";
import { withIronSession } from "next-iron-session";
import { useRouter } from "next/router";
import Head from "next/head";
import Avatar from "../../components/avatar";
import { User, Message, Conversation } from "../../types/types";
import {
  MessagesApiResponse,
  IApiResponseError,
  ProfileApiResponse,
} from "../../types/apiResponseTypes";
import { Recache } from "recache-client";

type PropsMessage = {
  text: string;
  sent: boolean;
};
import { io } from "socket.io-client";
import { Events } from "../../common/events";

let socketIO;

const MessageFun = ({ text, sent }: PropsMessage) => {
  if (sent) {
    return (
      <div className="ml-auto bg-blue-100 w-3/5 p-2 rounded-lg shadow-md">
        <p>{text}</p>
      </div>
    );
  } else {
    return (
      <div className="bg-slate-100 w-3/5 p-2 rounded-lg shadow">
        <p>{text}</p>
      </div>
    );
  }
};

type PropsConversations = {
  selectedUser: Conversation;
  setSelectedUser: Dispatch<SetStateAction<Conversation>>;
  conversations: Array<Conversation>;
  unreadMessages: Array<number>;
};

const Conversations = ({
  selectedUser,
  setSelectedUser,
  conversations,
  unreadMessages,
}: PropsConversations) => {
  const [filter, setFilter] = useState<string>("");
  const [filteredConversations, setFilteredConversations] = useState<
    Array<Conversation>
  >([
    {
      id: 1,
      email: "kyle@gmail.com",
      username: "Kyle",
      location: "United States",
      logo: "/assets/avatars/Kyle.png",
      unread: 10,
      typename: "Conversation",
    },
    {
      id: 2,
      email: "kathryn@gmail.com",
      username: "Kathryn Cooper",
      location: "Ukraine",
      logo: "/assets/avatars/Kathryn Cooper.png",
      unread: 120,
      typename: "Conversation",
    },
    {
      id: 3,
      email: "authur@gmail.com",
      username: "Arthur Cooper",
      location: "France",
      logo: "/assets/avatars/Arthur Cooper.png",
      unread: 3,
      typename: "Conversation",
    },
    {
      id: 4,
      email: "colleen@gmail.com",
      username: "Colleen Pena",
      location: "Ukraine",
      logo: "/assets/avatars/Colleen Pena.png",
      unread: 9,
      typename: "Conversation",
    },
    {
      id: 5,
      email: "jennie@gmail.com",
      username: "Jennie Miles",
      location: "Belgium",
      logo: "/assets/avatars/Jennie Miles.png",
      unread: 0,
      typename: "Conversation",
    },
    {
      id: 7,
      email: "regina@gmail.com",
      username: "Regina Cooper",
      location: "France",
      logo: "/assets/avatars/Regina Cooper.png",
      unread: 7,
      typename: "Conversation",
    },
    {
      id: 8,
      email: "caesar@gmail.com",
      username: "Caesar",
      location: "Brazil",
      logo: "/assets/avatars/Caesar.png",
      unread: 0,
      typename: "Conversation",
    },
    {
      id: 9,
      email: "floyd@gmail.com",
      username: "Floyd Flores",
      location: "United Kingdom",
      logo: "/assets/avatars/Floyd Flores.png",
      typename: "Conversation",
    },
    {
      id: 10,
      email: "brandon@gmail.com",
      username: "Brandon Steward",
      location: "Germany",
      logo: "/assets/avatars/Brandon Steward.png",
      typename: "Conversation",
    },
  ]);

  useEffect(() => {
    try {
      Recache.logEvent_AutodetectIp("messages");
    } catch (e) {
      console.log(e);
    }
  }, []);

  // useEffect(() => {
  //   setFilteredConversations([...conversations]);
  // }, [conversations]);

  useEffect(() => {
    if (filter != "")
      setFilteredConversations(
        conversations.filter(
          (a: { username: string; email: string }) =>
            a.username.toLowerCase().includes(filter.toLowerCase()) ||
            a.email.toLowerCase().includes(filter.toLowerCase())
        )
      );
  }, [filter]);

  return (
    <div className="flex flex-col w-1/3 min-w-[280px] overflow-y-scroll">
      <Head>
        <title>Messages - Conenctive</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <input
        placeholder="Search..."
        onChange={(e) => {
          setFilter(e.target.value);
        }}
        className="outline-none border border-slate-400 pl-[32px] pr-[14px] text-sm m-2 py-2 rounded-md focus:border-slate-600 transition-all hover:border-slate-600"
      ></input>

      {filteredConversations.map((item, index) => {
        return (
          <div
            key={index}
            onClick={() => {
              setSelectedUser(item);
            }}
            className={`${
              selectedUser?.id == item.id
                ? "bg-slate-400/20"
                : "bg-white hover:bg-slate-100/50"
            } conversation-item`}
          >
            {item.logo ? (
              <img
                src={item.logo}
                className="w-12 h-12 bg-white rounded-full shadow-lg"
              />
            ) : (
              <Avatar
                className="rounded-full shadow-lg"
                width="48px"
                height="48px"
                title={item.username}
              />
            )}
            <div className="flex flex-col flex-grow gap-[2px] text-[14px] font-[Poppins] my-auto ml-2">
              <p className="font-bold">{item.username}</p>
              <p className="text-slate-500">Thank you!</p>
            </div>
            {item.id !== selectedUser.id && item.unread > 0 ? (
              <div className="flex flex-col gap-[2px] text-[14px] font-[Poppins]">
                <p className="text-slate-500">6:34 PM</p>
                <span className="bg-[#7E38B7] text-[13px] px-[7px] font-bold rounded-full w-fit min-w-[25px] min-h-[25px] text-white flex items-center justify-center">
                  {item.unread}
                </span>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

type PropsChat = {
  users: Array<User>;
  selectedUser: Conversation;
  user: User;
  conversations: Array<Conversation>;
  getConversations: () => Promise<void>;
};

const Chat = ({
  users,
  selectedUser,
  user,
  conversations,
  getConversations,
  setConversations,
}) => {
  const [messages, setMessages] = useState([]);
  const [isNewMessageArrived, setIsNewMessageArrived] = useState(false);
  const [showError, setShowError] = useState(false);
  const [socketToken, setSocketToken] = useState("abcd");
  const timeoutRef = useRef<any>(null);
  const [userOptions, setUserOptions] = useState([]);
  const [text, setText] = useState("");
  let prevMessages = 0;

  const scrollWindow = () => {
    document.getElementById("messages-container").scroll({
      top: document.getElementById("messages-container").scrollHeight,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    let temp = [];
    users.forEach((user) => {
      temp.push({
        value: user.id,
        label: user.username + " (" + user.email + ")",
      });
    });
    setUserOptions(temp);
  }, [users]);

  // useEffect(()=>{
  //   if(user?.id && !socketToken){
  //     (async()=>{
  //       try {
  //         const { data: { key } } = await axios.get(`${process.env.NEXT_PUBLIC_SOCKET_HOST}/socket/connection/key/${user.id}`,
  //         { withCredentials: true })
  //         setSocketToken(key)
  //       } catch (error) {
  //         setShowError(true);
  //       }
  //     })()
  //   }
  // },[user, socketToken])

  useEffect(() => {
    if (user && selectedUser && socketToken) {
      if (!socketIO) {
        socketIO = io(process.env.NEXT_PUBLIC_SOCKET_HOST);

        socketIO.on(Events.DISCONNECT, () => {
          setShowError(true);
          socketIO = null;
          setSocketToken("");
        });
      }
      if (typeof Events.NEW_MESSAGE_TO_ID === "function") {
        socketIO.on(
          Events.NEW_MESSAGE_TO_ID(`${selectedUser.id}_${user.id}`),
          (msg) => {
            setMessages((prevMsgs) => {
              const msgs = [...prevMsgs];
              msgs.push(msg);
              return msgs;
            });
            setIsNewMessageArrived(true);
            readMessages({ sender: selectedUser.id, receiver: user.id });
          }
        );
      }
      if (typeof Events.NEW_UNREAD_CONVERSATION_RECEIVER_ID === "function") {
        socketIO.on(
          Events.NEW_UNREAD_CONVERSATION_RECEIVER_ID(user.id),
          (conversations) => {
            const mappedConversations = conversations.map((conversation) => {
              if (conversation.id === selectedUser?.id) {
                return {
                  ...conversation,
                  unread: 0,
                };
              }
              return conversation;
            });
            setConversations(mappedConversations);
          }
        );
      }
      return () => {
        if (typeof Events.NEW_MESSAGE_TO_ID === "function") {
          socketIO?.off(
            Events.NEW_MESSAGE_TO_ID(`${selectedUser.id}_${user.id}`)
          );
        }
        if (typeof Events.NEW_UNREAD_CONVERSATION_RECEIVER_ID === "function") {
          socketIO?.off(Events.NEW_UNREAD_CONVERSATION_RECEIVER_ID(user.id));
        }
      };
    }
  }, [user, selectedUser, socketToken]);

  useEffect(() => {
    if (isNewMessageArrived) {
      scrollWindow();
      setIsNewMessageArrived(false);
    }
  }, [isNewMessageArrived]);

  useEffect(() => {
    if (selectedUser != null) {
      getMessages();
      const clonedConversations = [...conversations];
      const foundIndex = clonedConversations.findIndex(({ id }) => {
        return selectedUser.id === id;
      });

      if (foundIndex > -1) {
        clonedConversations[foundIndex].unread = 0;
      }
      setConversations(clonedConversations);
    } else {
      setMessages([]);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (showError) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setShowError(false);
      }, 1500);
    }
  }, [showError]);

  const sendMessage = async () => {
    if (
      (document.getElementById("message-input") as HTMLInputElement).value != ""
    ) {
      try {
        if (socketIO.connected) {
          (document.getElementById("message-input") as HTMLInputElement).value =
            "";
          setMessages([...messages, { sender: user.id, text }]);
          setIsNewMessageArrived(true);
          await axios.post("/api/messages/" + selectedUser.id, { text });
          socketIO.emit(Events.SEND_MESSAGE, {
            receiver: selectedUser.id,
            sender: user.id,
            text,
          });
          //Re-fetch the list of conversations if the message was sent to a new conversation

          if (
            conversations.filter((a) => a.id == selectedUser.id).length == 0
          ) {
            getConversations();
          }
        } else {
          setShowError(true);
        }
      } catch (e) {
        setShowError(true);
      }
    }
  };

  const getMessages = async () => {
    let temp = messages;
    const { data } = await axios.get("/api/messages/" + selectedUser.id);
    prevMessages = data.length;
    setMessages(data.messages);
    setIsNewMessageArrived(true);

    const emailz = await axios("/api/messages/unread-messages-mailer", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    await readMessages({ sender: selectedUser.id, receiver: user.id });
  };

  const readMessages = async ({ sender, receiver }) => {
    const data = {
      sender,
      receiver,
    };
    await axios.post("/api/messages/read-message", {
      header: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      data,
    });
  };

  // Send message on pressing Enter key
  const messageInputRef = useRef(null);
  useEffect(() => {
    const keyDownHandler = (event) => {
      if (
        event.key === "Enter" &&
        document.activeElement === messageInputRef.current
      ) {
        document.getElementById("message-submit-button").click();
      }
    };
    document.addEventListener("keydown", keyDownHandler);
    return () => {
      document.removeEventListener("keydown", keyDownHandler);
    };
  }, []);

  return (
    <div className="flex flex-col h-full w-4/5 rounded-r-lg">
      {selectedUser && (
        <div className="flex flex-row w-full p-2 gap-[10px]">
          <img
            src={selectedUser.logo}
            className="w-[40px] h-[40px] bg-white rounded-full shadow-lg"
          />
          <p className="font-semibold text-base w-full mt-2 pb-2 border-b-2 border-slate-100">
            {selectedUser?.username}
          </p>
        </div>
      )}

      <div
        id="messages-container"
        className="h-full overflow-y-scroll p-5 flex flex-col gap-10"
      >
        {messages?.map((item, index) => {
          return (
            <MessageFun
              text={item.text}
              sent={item.sender == user.id}
            ></MessageFun>
          );
        })}
      </div>
      {selectedUser && (
        <div className="flex flex-row p-5 gap-5">
          <input
            ref={messageInputRef}
            id="message-input"
            placeholder="Type something..."
            onChange={(e) => {
              setText(e.target.value);
            }}
            className="outline-none w-full pl-[32px] pr-[14px] text-[14px] h-[47px] border border-black/20 rounded-md focus:outline-blue-200 transition-all hover:outline hover:outline-blue-300"
          ></input>
          <button
            id="message-submit-button"
            className="w-fit px-10"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      )}
      {showError && (
        <div className="ml-3 text-sm font-normal text-red-400 mb-4">
          Error connecting to server!
        </div>
      )}
    </div>
  );
};

const UserDetails = ({ selectedUser }) => {
  return (
    <div className="w-1/3 h-full px-2 py-3">
      {selectedUser && (
        <>
          {selectedUser.logo ? (
            <img
              src={selectedUser.logo}
              className="w-12 h-12 bg-white rounded-full shadow-lg m-auto"
            />
          ) : (
            <Avatar
              className="rounded-full shadow-lg m-auto"
              width="30px"
              height="30px"
              title={selectedUser.username}
            />
          )}
          <p className="font-bold text-lg text-center mt-2">
            {selectedUser.username}
          </p>
          <p className="text-sm font-bold mt-4">Contact Details:</p>
          <div className="flex flex-row gap-2 my-3">
            <div className="bg-black/5 rounded-full p-[7px] w-8 h-8 shadow-lg">
              <img src="/assets/email.png"></img>
            </div>
            <p className="text-sm my-auto break-all">{selectedUser.email}</p>
          </div>
          <div className="flex flex-row gap-2">
            <div className="bg-black/5 rounded-full p-[7px] w-8 h-8 shadow-lg">
              <img src="/assets/location.png"></img>
            </div>
            <p className="text-sm my-auto break-all">{selectedUser.location}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default function Messages({ user }) {
  const router = useRouter();
  const { newUser } = router.query;
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<Conversation>({
    id: 1,
    email: "vadym@gmail.com",
    username: "Vadym",
    location: "Ukraine",
    logo: "",
    typename: "Conversation",
  });

  // Automatically open latest (last opened) conversation when navigating to messages page
  useEffect(() => {
    let x: (prevState: undefined) => undefined;
    if (sessionStorage.selectedUser)
      x = JSON.parse(sessionStorage.selectedUser);
    if (x !== undefined) {
      setSelectedUser(x);
    }
  }, []);

  useEffect(() => {
    if (selectedUser != undefined) {
      window.sessionStorage.setItem(
        "selectedUser",
        JSON.stringify(selectedUser)
      );
    }
  }, [selectedUser]);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [sum, setSum] = useState();
  const [unreadMessages, setUnreadMessages] = useState([]);

  const getUsers = async () => {
    const data: ProfileApiResponse.IProfiles = (
      await axios.get("/api/profiles/all")
    ).data;
    setUsers(data.users);
    if (newUser) {
      const temp = data.users.filter(
        (item) => item.id.toString() == newUser
      )[0];
      const selectedUser = {
        id: temp.id,
        email: temp.email,
        username: temp.username,
        location: "",
        logo: temp.logo,
      } as Conversation;
      setSelectedUser(selectedUser);
    }
  };

  const getConversations = async () => {
    try {
      const data: MessagesApiResponse.IConversations = (
        await axios.get("/api/messages/conversations")
      ).data;
      // let tempConversations = data.conversations;
      let conversations = data.conversations;
      conversations = conversations.map((conversation) => {
        if (conversation.id === selectedUser?.id) {
          return {
            ...conversation,
            unread: 0,
          };
        }
        return conversation;
      });
      setConversations(conversations);
      // setSum(unreadMessages?.reduce((a, v) => a + v, 0));
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getUsers();
    getConversations();
  }, []);

  return (
    <Layout user={user} category="Chat" title="Messages">
      <div className="bg-white h-full overflow-clip mt-3 flex flex-row">
        <Conversations
          unreadMessages={unreadMessages}
          selectedUser={selectedUser}
          conversations={conversations}
          setSelectedUser={setSelectedUser}
        ></Conversations>
        <Chat
          user={user}
          users={users}
          selectedUser={selectedUser}
          conversations={conversations}
          getConversations={getConversations}
          setConversations={setConversations}
        ></Chat>
        <UserDetails selectedUser={selectedUser}></UserDetails>
      </div>
    </Layout>
  );
}

export const getServerSideProps = withIronSession(
  async ({ req, res }) => {
    const user = req.session.get("user");

    if (!user) {
      return { props: {} };
    }

    return {
      props: { user },
    };
  },
  {
    cookieName: "Connective",
    cookieOptions: {
      secure: process.env.NODE_ENV == "production" ? true : false,
    },
    password: process.env.APPLICATION_SECRET,
  }
);
