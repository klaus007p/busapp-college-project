import React from "react";
import { BrowserRouter as Router, Redirect, Route, Switch } from "react-router-dom";
import AuthPage from "./components/Auth/AuthPage";
import RouteSelection from "./components/RouteSelection/RouteSelection";
import Profile from "./components/Profile/Profile";
import TicketPage from "./components/TicketPage/TicketPage";
import "./App.css";

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route exact path={["/", "/login", "/register"]} component={AuthPage} />
          <Route path="/routes" exact component={RouteSelection} />
          <Route path="/profile" exact component={Profile} />
          <Route path="/getTicket" exact component={TicketPage} />
          <Redirect to="/" />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
