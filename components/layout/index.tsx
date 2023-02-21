import { UserSession } from "../../types/types";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import searchIcon from "../../public/assets/search-2.svg";
import notifier from "../../public/assets/navbar/notifier.svg";
import Sidebar from "../sidebar";
import Avatar from "../avatar";

type Props = {
  title: string;
  category: string;
  scroll?: boolean;
  user: UserSession;
  children: React.ReactNode;
};

const Layout = ({ category, title, scroll = true, user, children }: Props) => {
  const [keyword, setKeyword] = useState<string>("");

  return (
    <main
      className={`flex flex-column ${
        scroll ? "min-h-screen" : "h-screen max-h-screen"
      } min-w-screen font-[Montserrat]`}
    >
      <div className="flex flex-row items-center bg-[#F8F9FA] font-bold text-3xl leading-[29px] text-[#0D1011] 
        2xl:pt-[25px] 2xl:pb-[25px] 4bp:pt-[20px] 4bp:pb-[20px]">
        <div className="w-[266px] pl-[30px]">
          <Link href="/">
            <div className="flex flex-row cursor-pointer items-center gap-2">
              <Image
                className="w-[2vh] h-[4vh]"
                src="/assets/logo1.svg"
                width="40px"
                height="40px"
                priority
              />
              <Image
                className="w-[5vh] h-[1.5vh]"
                src="/assets/logo2.svg"
                width="125px"
                height="20px"
                priority
              />
            </div>
          </Link>
        </div>
        <div className="2xl:pl-[40px] xl:pl-[30px] items-center">
          <span className="font-['Poppins'] text-[#A0AEC0] text-[14px] font-[400]">{category} / </span>
          <span className="font-['Poppins'] text-[#111111] text-[36px] font-[600]">{title}</span>
        </div>
        <div className="flex ml-auto mr-8">
          <div className="relative">
            <div className="absolute z-[10] py-[5px] pl-[12px]">
              <Image
                src={searchIcon}
                alt="Search icon"
                width="16px"
                height="16px"
              />
            </div>
            <input
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search here....."
              className=" w-[300px] rounded-3xl border border-[#A0AEC0]/10 pl-10 text-[12px] py-1"
            />
          </div>
          <div className="flex ml-10 bg-[#A0AEC0]/10 rounded-3xl w-10 items-center pl-2">
            <Image
              src={notifier}
            />
          </div>
          {user.picture ? 
            <div className="flex ml-5 border-[#A0AEC0]/10 rounded-3xl border-4 w-10 items-center pl-1">
              <Image
                src={user.picture}
              /> 
            </div>
            : 
              <div className="flex ml-5">
                <Avatar
                  width="40px"
                  height="40px"
                  title={user.name}
                />
              </div>
          }
          <div className="flex flex-col ml-2">
            <span className="font-['Poppins'] text-[#111111] text-sm font-semibold">{user.name}</span>
            <span className="font-['Poppins'] text-[#A0AEC0] text-xs font-medium">Manager</span>
          </div>
        </div>
      </div>
      <div className="flex flex-row">
        <Sidebar user={user}></Sidebar>
        <div
          className={`w-screen h-screen ${
            scroll ? "overflow-y-scroll" : "h-full max-h-screen"
          } flex flex-col bg-[#F5F5F5] relative`}
        >
          {children}
        </div>
      </div>
    </main>
  );
};

export default Layout;
