import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import HttpPage from "./pages/HttpPage";
import { ServerPage } from "./pages/ServerPage";
import { ConfigProvider } from "./api/components/ConfigProvider";
import { useEffect, useState } from "react";

export type ModuleItem = {
  key: number;
  label: string;
  route: string;
};

const modules: ModuleItem[] = [
  { key: 1, label: "HTTP", route: "/http" },
  { key: 2, label: "Server", route: "/server/0" },
];

type ModuleKey = (typeof modules)[number]["key"];

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [moduleKey, setModuleKey] = useState<ModuleKey>(1);

  useEffect(() => {
    const currentModule = modules.find((m) => m.route === location.pathname);
    if (currentModule) {
      setModuleKey(currentModule.key);
    }
  }, [location.pathname]);

  const handleModuleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(e.target.value);

    if (index === 0 || isNaN(index)) {
      return;
    }

    setModuleKey(index as ModuleKey);
    navigateToSelectedModule(index as ModuleKey);
  };

  const getSelectedModule = () => {
    const module = modules.find((m) => m.key === moduleKey);

    if (module) {
      return (
        <div>
          <p className="text-black">{module.label}</p>
        </div>
      );
    }
    console.error("Module not found");
  };

  const navigateToSelectedModule = (key: ModuleKey) => {
    const module = modules.find((m) => m.key === key);
    if (module) {
      navigate(module.route);
    }
  };

  return (
    <div>
      <Navbar
        modules={modules}
        onSelect={handleModuleSelect}
        getSelectedModule={getSelectedModule}
      />
      <Outlet />
    </div>
  );
};

const App = () => {
  return (
    <ConfigProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/http" replace />} />
            <Route path="/http" element={<HttpPage />} />
            <Route path="/server/:serverIndex" element={<ServerPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
