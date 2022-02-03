import React, { Suspense } from "react";
import { I18nextProvider } from "react-i18next";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { Spinner } from "react-bootstrap";

import i18next from "./services/i18n";
import reportWebVitals from "./reportWebVitals";
import Routes from "./Routes";

ReactDOM.render(
  <Suspense fallback={<Spinner animation="border" role="status" />}>
    <BrowserRouter>
      <I18nextProvider i18n={i18next}>
        <Routes />
      </I18nextProvider>
    </BrowserRouter>
  </Suspense>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
