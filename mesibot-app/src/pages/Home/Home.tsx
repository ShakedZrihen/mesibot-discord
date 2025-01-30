import { useRoutes, useLocation } from "react-router-dom";
import { Topbar } from "../../components/Topbar";
import { StyledPage } from "../Page.style";
import { routes } from "../../routes/routes";

export const Home = () => {
  const location = useLocation();

  // Find the current route to update Topbar
  const currentRoute = routes.find((route) =>
    location.pathname.match(new RegExp(`^${route.path.replace(/:\w+/g, ".*")}$`))
  );

  // Automatically generates routes from the array
  const routesElement = useRoutes(
    routes.map((route) => ({
      path: route.path,
      element: <route.component />
    }))
  );

  return (
    <StyledPage>
      <Topbar subtitle={currentRoute?.name.toLowerCase()} showPlaylistPicker={currentRoute?.showPlaylistPicker} />
      {routesElement}
    </StyledPage>
  );
};
