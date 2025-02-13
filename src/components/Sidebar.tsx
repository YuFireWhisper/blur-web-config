import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  MapPin,
  Shield,
} from "lucide-react";
import { BASE_URL_PATH } from "../App";

type LanguageContent = {
  server: string;
  location: string;
  ssl: string;
};

type LanguageMap = {
  [key: string]: LanguageContent;
};

const LANGUAGES: LanguageMap = {
  "zh-TW": {
    server: "伺服器設定",
    location: "位置設定",
    ssl: "SSL設定",
  },
  en: {
    server: "Server Settings",
    location: "Location Settings",
    ssl: "SSL Settings",
  },
};

interface SidebarProps {
  serverIndex: string;
  lang?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  serverIndex,
  lang = "zh-TW",
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const texts = LANGUAGES[lang] || LANGUAGES["zh-TW"];

  const tabs = [
    {
      id: "server",
      label: texts.server,
      path: BASE_URL_PATH + `/server/${serverIndex}`,
      icon: Settings,
    },
    {
      id: "location",
      label: texts.location,
      path: BASE_URL_PATH + `/server/${serverIndex}/location`,
      icon: MapPin,
    },
    {
      id: "ssl",
      label: texts.ssl,
      path: BASE_URL_PATH + `/server/${serverIndex}/ssl`,
      icon: Shield,
    },
  ];

  const currentTab =
    tabs.find((tab) => location.pathname === tab.path)?.id || "server";

  if (!location.pathname.includes("/server/")) {
    return null;
  }

  const getButtonStyles = (isActive: boolean) =>
    [
      "flex items-center rounded-lg px-3 py-2 text-base font-medium transition-all duration-200",
      "hover:bg-gray-100",
      isActive ? "bg-gray-100 text-blue-600" : "text-gray-600",
      isCollapsed ? "hidden" : "justify-start",
    ].join(" ");

  const getIconStyles = (isActive: boolean) =>
    [
      "h-6 w-6",
      isActive ? "text-blue-600" : "text-gray-500",
      isCollapsed ? "mx-auto" : "",
    ].join(" ");

  return (
    <div
      className={[
        "relative h-screen bg-white shadow-lg transition-all duration-300 ease-in-out mt-[5vh]",
        isCollapsed ? "w-16" : "w-64",
      ].join(" ")}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={[
          "absolute z-10 flex h-8 w-8 items-center justify-center rounded-full",
          "bg-white shadow-md transition-all duration-300",
          isCollapsed ? "right-0 top-4 translate-x-1/2" : "-right-4 top-4",
        ].join(" ")}
      >
        {isCollapsed ? (
          <ChevronRight className="h-5 w-5 text-gray-600" />
        ) : (
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        )}
      </button>
      <div className="flex flex-col gap-2 p-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <React.Fragment key={tab.id}>
              {!isCollapsed && (
                <button
                  onClick={() => navigate(tab.path)}
                  className={getButtonStyles(isActive)}
                >
                  <Icon className={getIconStyles(isActive)} />
                  <span className="ml-3">{tab.label}</span>
                </button>
              )}
              {isCollapsed && (
                <button
                  onClick={() => navigate(tab.path)}
                  className={[
                    "flex w-full justify-center rounded-lg py-2",
                    "transition-all duration-200 hover:bg-gray-100",
                  ].join(" ")}
                >
                  <Icon className={getIconStyles(isActive)} />
                </button>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
