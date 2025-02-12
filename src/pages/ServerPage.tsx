import React from "react";
import { Outlet, useParams } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";

export const ServerLayout: React.FC = () => {
  const { serverIndex } = useParams();

  if (!serverIndex) {
    return <Outlet />;
  }

  return (
    <div className="flex">
      <Sidebar serverIndex={serverIndex} />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};
