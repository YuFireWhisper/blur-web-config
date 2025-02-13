import { ReactNode } from "react";
import ModuleSelector, { ModuleItem } from "./ModuleSelector";
import { useNavigate } from "react-router-dom";
import { BASE_URL_PATH } from "../App";

interface NavbarProps {
  modules: ModuleItem[];
  onSelect: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  getSelectedModule: () => ReactNode;
}

const Navbar = ({ modules, onSelect, getSelectedModule }: NavbarProps) => {
  const navigate = useNavigate();

  return (
    <nav className="min-w-full bg-gray-900 shadow-lg border-b border-gray-800">
      <div className="flex flex-row justify-between items-center">
        <div
          className={[
            "text-white text-4xl font-bold tracking-wider",
            "cursor-pointer hover:text-gray-300 transition-colors",
            "ml-[3vw]",
          ].join(" ")}
          onClick={() => navigate(BASE_URL_PATH)}
        >
          Blur
        </div>
        <ModuleSelector
          modules={modules}
          onSelect={onSelect}
          getSelectedModule={getSelectedModule}
        />
      </div>
    </nav>
  );
};

export default Navbar;
