import { motion } from "framer-motion";
import { PropsWithChildren } from "react";
import { MAX_OFFSET, useListSwiperContext } from "../Context/Context";

export interface ListSwiperContentProps extends PropsWithChildren {
  drag?: boolean;
}

export const Content = ({ children, drag }: ListSwiperContentProps) => {
  const { x, onSwipe } = useListSwiperContext();

  const handleDragEnd = () => {
    if (x.get() > MAX_OFFSET) return onSwipe("right");
    if (x.get() < -MAX_OFFSET) return onSwipe("left");
  };

  return (
    <motion.div
      drag={drag && "x"}
      dragSnapToOrigin
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.3}
      dragTransition={{ bounceStiffness: 600, bounceDamping: 40 }}
      onDragEnd={handleDragEnd}
      style={{ x, flexGrow: 1 }}
    >
      {children}
    </motion.div>
  );
};
