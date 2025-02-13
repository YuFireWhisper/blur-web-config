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
import { ConfigProvider } from "./api/components/ConfigProvider";
import { useEffect, useState } from "react";
import { LocationPage } from "./pages/LocationPage";
import { SSLPage } from "./pages/SSLPage";
import { ServerLayout } from "./pages/ServerPage";
import { ServerConfigPage } from "./pages/ServerConfigPage";

export const BASE_URL_PATH: string = "/web_config";

export type ModuleItem = {
  key: number;
  label: string;
  route: string;
};

const modules: ModuleItem[] = [
  { key: 1, label: "HTTP", route: BASE_URL_PATH + "/http" },
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
            <Route
              path={BASE_URL_PATH}
              element={<Navigate to={`${BASE_URL_PATH}/http`} replace />}
            />
            <Route path={`${BASE_URL_PATH}/http`} element={<HttpPage />} />
            <Route element={<ServerLayout />}>
              <Route
                path={`${BASE_URL_PATH}/server/:serverIndex`}
                element={<ServerConfigPage />}
              />
              <Route
                path={`${BASE_URL_PATH}/server/:serverIndex/location`}
                element={<LocationPage />}
              />
              <Route
                path={`${BASE_URL_PATH}/server/:serverIndex/ssl`}
                element={<SSLPage />}
              />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
