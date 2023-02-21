import { useRouter } from "next/router";
import { useState, useEffect, MouseEventHandler } from "react";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import {
  IApiResponseError,
  MessagesApiResponse,
} from "../../types/apiResponseTypes";
import { Message } from "../../types/types";

type Props = {
  text: string;
  text2?: string | number;
  route?: string | URL;
  icon: string;
  selectedIcon: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
  target?: string;
};

const SidebarItem = ({
  text,
  text2 = "",
  route = "",
  icon,
  selectedIcon,
  onClick = undefined,
  target = undefined,
}: Props) => {
  const router = useRouter();

  let selected =
    router.route == route ||
    (router.route.includes("/app/profile") &&
      (route as string).includes("/app/profile"));
  console.log(router.route, route);
  if (typeof onClick == "undefined") {
    onClick = () => {
      router.push(route);
    };
  }
  if (typeof target != "undefined") {
    onClick = () => {
      window.open(route, "_blank");
    };
  }

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer text-[14px] font-['Poppins'] 2xl:mb-[12px] xl:mb-[10px] font-[600] w-full transition-all hover:bg-[#051533]/10 ${
        selected
          ? "rounded-xl bg-gradient-[120deg] from-[#3836D2] to-[#FFFFFF] text-[#7E38B7] p-[1px]"
          : "text-[#A0AEC0]"
      } ${text == "Sign Out" ? "mt-auto" : ""}`}
    >
      <div
        className={`flex flex-row w-full rounded-xl py-[17px] px-[16px] ${
          selected ? "bg-[rgb(255,255,255)]" : ""
        }`}
      >
        <img
          className="w-[20px] h-[20px] mr-[12px] my-auto"
          src={!selected ? icon : selectedIcon}
        />
        <p>{text}</p>
        <p>{text2}</p>
      </div>
    </div>
  );
};

const Sidebar = ({ user }) => {
  const router = useRouter();
  const { data: session } = useSession();

  const signout = async () => {
    try {
      await axios.get("/api/auth/destroysession");
      if (session) {
        await signOut();
      }
    } catch (e) {
      console.log(e);
    } finally {
      router.push("/");
    }
  };

  const [sum, setSum] = useState();
  const [unreadMessages, setUnreadMessages] = useState([]);

  const getConversations = async () => {
    try {
      const data: MessagesApiResponse.IConversations = (
        await axios.get("/api/messages/conversations")
      ).data;
      let tempConversations = data.conversations;
      let conversations = [...tempConversations];
      conversations?.map(async (conversation, index) => {
        let unread = await getUnreadMessages(conversation.id);
        conversation.unread = unread;
        unreadMessages[conversation.id] = unread;
      });
      setSum(unreadMessages?.reduce((a, v) => a + v, 0));
    } catch (e) {
      console.log(e);
    }
  };

  const getUnreadMessages = async (id: number) => {
    const res: MessagesApiResponse.IGetOtherID | IApiResponseError = (
      await axios.get("/api/messages/" + id)
    ).data;
    if (res.type == "IApiResponseError") {
      throw res;
    } else {
      if (res.messages) {
        const unReadMesssages = res.messages.filter((message: Message) => {
          return !message.read && message.receiver == user.id;
        }).length;
        return unReadMesssages;
      }
    }
  };

  useEffect(() => {
    getConversations();
  }, []);

  return (
    <div className="w-[266px] grow-0 shrink-0 z-10 h-fill bg-[#F8F9FA] flex flex-col text-white font-[Montserrat] 2xl:pt-[30px] xl:pl-[30px] xl:pr-[17px] xl:pt-[25px]">
      <div className="2xl:mb-[28px] xl:mb-[20px]">
        <p className="font-[Poppins] uppercase line font-[700] text-[12px] leading-[18px] text-[#A0AEC0] 2xl:mb-[12px] xl:mb-[10px]">
          General
        </p>
        <SidebarItem
          text="Dashboard"
          icon="/assets/navbar/DashboardIcon1.svg"
          selectedIcon="/assets/navbar/DashboardIcon2.svg"
          route="/app/dashboard"
        ></SidebarItem>
        <SidebarItem
          text="Profile"
          icon="/assets/navbar/ProfileIcon1.svg"
          selectedIcon="/assets/navbar/ProfileIcon2.svg"
          route={`/app/profile/${user?.id ? user.id : 0}`}
        ></SidebarItem>
      </div>

      {/*
      <div  className="mb-3">
        <p  className="font-[Montserrat] font-bold text-[1.5vh] leading-[20px] text-[#BFBFBF] mb-2">
          As a buyer
        </p>
        <SidebarItem
          text="Marketplace"
          icon="/assets/navbar/MarketplaceIcon.svg"
          route="/app/marketplace"
        ></SidebarItem>
        <SidebarItem
          text="Purchased Lists"
          icon="/assets/navbar/PurchasedListsIcon.svg"
          route="/app/lists/purchased"
        ></SidebarItem>
      </div>

      <div  className="mb-3">
        <p  className="font-[Montserrat] font-bold text-[1.5vh] leading-[20px] text-[#BFBFBF] mb-2">
          As a seller
        </p>
        <SidebarItem
          text="Lists"
          icon="/assets/navbar/ListsIcon.svg"
          route="/app/lists"
        ></SidebarItem>
        <SidebarItem
          text="Earnings"
          icon="/assets/navbar/EarningsIcon.svg"
          route="/app/earnings"
        ></SidebarItem>
        <SidebarItem
          text="Requests List"
          icon="/assets/navbar/RequestsListIcon.svg"
          route="/app/requests"
        ></SidebarItem>
      </div>
      */}
      <div className="2xl:mb-[28px] xl:mb-[20px]">
        <p className="font-[Poppins] uppercase line font-[700] text-[12px] leading-[18px] text-[#A0AEC0] mb-[12px]">
          Chat
        </p>
        <SidebarItem
          text="Messages"
          text2={sum && sum > 0 ? sum : null}
          icon="/assets/navbar/messages1.svg"
          selectedIcon="/assets/navbar/messages2.svg"
          route="/app/messages"
        ></SidebarItem>
        <SidebarItem
          text="Discover"
          icon="/assets/navbar/compass1.svg"
          selectedIcon="/assets/navbar/compass2.svg"
          route="/app/discover"
        ></SidebarItem>
      </div>

      <div className="2xl:mb-[28px] xl:mb-[20px]">
        <p className="font-[Poppins] uppercase line font-[700] text-[12px] leading-[18px] text-[#A0AEC0] mb-[12px]">
          Support
        </p>
        {/* <SidebarItem
          text="Feedback"
          icon="/assets/navbar/FeedbackIcon.svg"
          route="/app/feedback"
        ></SidebarItem> */}
        <SidebarItem
          text="Contact Us"
          icon="/assets/navbar/ContactUsIcon1.svg"
          selectedIcon="/assets/navbar/ContactUsIcon1.svg"
          route="https://calendly.com/connective-app/30min?month=2022-12"
          target="_blank"
        ></SidebarItem>
        <SidebarItem
          text="Join Our Slack"
          icon="/assets/navbar/Slack1.svg"
          selectedIcon="/assets/navbar/Slack1.svg"
          route="https://join.slack.com/t/connectiveaff-gdx2039/shared_invite/zt-1k972uih0-fn~2DbSdWPR8fTNRl~HCkw"
          target="_blank"
        ></SidebarItem>
      </div>

      {/* <Link href="http://www.connective-app.xyz/"> */}
      <SidebarItem
        text="Sign Out"
        icon="/assets/navbar/SignOutIcon.svg"
        selectedIcon="/assets/navbar/SignOutIcon.svg"
        onClick={signout}
      ></SidebarItem>
      {/* </Link> */}
    </div>
  );
};

export default Sidebar;
