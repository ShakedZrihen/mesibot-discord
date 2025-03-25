import { useMotionValue } from "framer-motion";
import { PropsWithChildren } from "react";
import { Action } from "./Action/Action";
import { ListSwiperContext } from "./Context/Context";
import { Content } from "./Content/Content";
import { Direction } from "./Context/Context";

interface Props extends PropsWithChildren {
  onSwipe?: (direction: "left" | "right") => void;
}

const ListSwiperItem = ({ children, onSwipe = console.log }: Props) => {
  const x = useMotionValue(0);

  return (
    <ListSwiperContext.Provider value={{ x, onSwipe }}>
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </ListSwiperContext.Provider>
  );
};

ListSwiperItem.Action = Action;
ListSwiperItem.Content = Content;

export {
  ListSwiperItem as default,
  ListSwiperItem,
  Action as ListSwiperAction,
  Content as ListSwiperContent,
  type Direction,
};
