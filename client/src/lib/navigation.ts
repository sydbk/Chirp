import { NavigateOptions, To } from "react-router-dom";

let navigateFn: (to: To, options?: NavigateOptions) => void;

export const setNavigate = (navigate: typeof navigateFn) => {
  navigateFn = navigate;
};

export const navigate = (to: To, options?: NavigateOptions) => {
  if (navigateFn) {
    navigateFn(to, options);
  } else {
    console.error("navigate function is not initialized.");
  }
};
