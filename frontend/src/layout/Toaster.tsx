import React from "react";
import { ToastContainer, toast, ToastOptions } from "react-toastify";

type Props = {
  theme: "light" | "dark";
};

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

const Toaster: React.FunctionComponent<Props> = ({ theme }): JSX.Element => {
  const toastConfig: ToastOptions = {
    autoClose: 5000,
    pauseOnHover: true,
    hideProgressBar: false,
    closeOnClick: true,
    position: "bottom-right",
    theme: theme,
  };

  return <ToastContainer {...toastConfig} />;
};

export default Toaster;
