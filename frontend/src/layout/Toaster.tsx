import React, { useContext } from "react";
import { ToastContainer, toast, ToastOptions } from "react-toastify";

import { AppContext } from "../App";
import { Themes } from "../tools/Themes";

export enum ToasterTypes {
  SUCCESS,
  INFO,
  WARN,
  ERROR,
}

export const addToast = (message: string, type: ToasterTypes = ToasterTypes.INFO): React.ReactText => {
  switch (type) {
    case ToasterTypes.INFO:
      return toast.info(message);
    case ToasterTypes.SUCCESS:
      return toast.success(message);
    case ToasterTypes.WARN:
      return toast.warn(message);
    case ToasterTypes.ERROR:
      return toast.error(message);
    default:
      return toast(message);
  }
};

const Toaster: React.FunctionComponent = (): JSX.Element => {
  const appContext = useContext(AppContext);
  const toastConfig: ToastOptions = {
    autoClose: 5000,
    pauseOnHover: true,
    hideProgressBar: false,
    closeOnClick: true,
    position: "bottom-right",
    theme: appContext.theme === Themes.LIGHT ? "light" : "dark",
  };

  return <ToastContainer {...toastConfig} />;
};

export default Toaster;
