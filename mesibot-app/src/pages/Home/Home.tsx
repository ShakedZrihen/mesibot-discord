/* eslint-disable @typescript-eslint/no-explicit-any */
import { Routes, Route, useLocation } from "react-router-dom";
import { Topbar } from "../../components/Topbar";
import { StyledPage } from "../Page.style";
import { routes } from "../../routes/routes";

export const Home = () => {
  const location = useLocation();
  const currentRoute = routes.find((route) => route.path === location.pathname);

  return (
    <StyledPage>
      <Topbar subtitle={currentRoute?.name.toLowerCase()} showPlaylistPicker={currentRoute?.showPlaylistPicker} />
      <Routes>
        {routes.map((route) => (
          <Route key={route.path} path={route.path} element={<route.component />} />
        ))}
      </Routes>
    </StyledPage>
  );
};
