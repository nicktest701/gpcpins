import { Slide } from "@mui/material";
import { forwardRef } from "react";

const SlideRightTransition = forwardRef(function Transition(props, ref) {
  return <Slide direction="right" ref={ref} {...props} />;
});

export default SlideRightTransition;
