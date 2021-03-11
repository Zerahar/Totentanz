import './App.css';
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import Home from './Home.js'
import Info from './Info.js'
import PlayerDashboard from './PlayerDashboard.js'
import AdminDashboard from './AdminDashboard.js'

function App() {
  return (
    <Router>
    <div>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/info">Info</Link>
        </li>
        <li>
          <Link to="/playerDashboard">Dashboard</Link>
        </li>
        <li>
          <Link to="/adminDashboard">Dashboard (Admin)</Link>
        </li>
      </ul>

      <hr />

      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <Route path="/info">
          <Info />
        </Route>
        <Route path="/playerDashboard">
          <PlayerDashboard />
        </Route>
        <Route path="/adminDashboard">
          <AdminDashboard />
        </Route>
      </Switch>
    </div>
  </Router>
);
}
export default App;






