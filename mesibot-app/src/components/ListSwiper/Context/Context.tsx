import { MotionValue } from "framer-motion";
import { createContext, useContext } from "react";

export const MAX_OFFSET = 40;

export type Direction = "left" | "right";

export interface ListSwiperContextType {
  x: MotionValue<number>;
  onSwipe: (diection: Direction) => void;
}

export const ListSwiperContext = createContext<ListSwiperContextType | null>(
  null,
);

export const useListSwiperContext = () => {
  const context = useContext(ListSwiperContext);
  if (!context) {
    throw new Error("useListSwiperContext must be used within a ListSwiper");
  }
  return context;
};
