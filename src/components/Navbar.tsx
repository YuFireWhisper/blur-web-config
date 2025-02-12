import { ReactNode } from "react";
import ModuleSelector, { ModuleItem } from "./ModuleSelector";

interface NavbarProps {
  modules: ModuleItem[];
  onSelect: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  getSelectedModule: () => ReactNode;
}

const Navbar = ({ modules, onSelect, getSelectedModule }: NavbarProps) => {
  return (
    <nav className="min-w-full flex justify-between items-center bg-gray-900 p-4">
      <div className="text-white text-xl ml-[5vw]">Hi, I'm a Navbar</div>
      <ModuleSelector
        modules={modules}
        onSelect={onSelect}
        getSelectedModule={getSelectedModule}
      />
    </nav>
  );
};

export default Navbar;
