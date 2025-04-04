import {
  motion,
  transform,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
} from "framer-motion";
import { PropsWithChildren } from "react";
import {
  Direction,
  MAX_OFFSET,
  useListSwiperContext,
} from "../Context/Context";

interface ActionProps extends PropsWithChildren {
  direction: Direction;
}

const ACTION_OFFSET = 30;
const ACTION_ROTATE = 90;
const ACTION_SIZE = 20;
const ACTION_SCALE = 0.8;

export const Action = ({ children, direction }: ActionProps) => {
  const { x: swiperX } = useListSwiperContext();

  const directionValue = direction === "right" ? -1 : 1;
  const maxOffset = directionValue * MAX_OFFSET;

  const opacity = useMotionValue(0);
  const rotate = useMotionValue(0);
  const x = useMotionValue(0);
  const scale = useSpring(ACTION_SCALE, {
    stiffness: 200,
    damping: 7,
    mass: 0.5,
  });

  useMotionValueEvent(swiperX, "change", (last) => {
    opacity.set(transform(last, [0, maxOffset], [0, 1]));

    rotate.set(
      transform(last, [0, maxOffset], [directionValue * -ACTION_ROTATE, 0], {
        clamp: true,
      }),
    );

    x.set(
      transform(
        last,
        [-MAX_OFFSET, 0, MAX_OFFSET],
        [directionValue * ACTION_OFFSET, 0, directionValue * ACTION_OFFSET],
      ),
    );

    if (last > MAX_OFFSET) {
      scale.set(1.2);
    } else if (last < -MAX_OFFSET) {
      scale.set(1.2);
    } else {
      scale.set(ACTION_SCALE);
    }
  });

  return (
    <motion.div
      style={{
        x,
        opacity,
        rotate,
        scale,
        left: direction === "left" ? -ACTION_SIZE : "auto",
        right: direction === "right" ? -ACTION_SIZE : "auto",
        position: "absolute",
      }}
    >
      {children}
    </motion.div>
  );
};
