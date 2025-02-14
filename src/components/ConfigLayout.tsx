import React from "react";

interface ConfigLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const ConfigLayout: React.FC<ConfigLayoutProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <div className="w-auto flex flex-col p-[5vw] gap-3">
      <div className="w-fit flex flex-col gap-[2vh]">
        <h1 className="text-5xl font-bold">{title}</h1>
        {description && (
          <p className="text-3xl text-gray-500 text-right">{description}</p>
        )}
      </div>
      <div className="w-2/3 ml-[2vw]">{children}</div>
    </div>
  );
};
