import './App.css';
import { Component } from 'react'
import { BrowserRouter as Router, Route, Link, Switch, Redirect } from "react-router-dom";
import Home from './Home.js'
import Info from './Info.js'
import PlayerDashboard from './PlayerDashboard.js'
import AdminDashboard from './AdminDashboard.js'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: '',
      userName: '',
      userType: 'guest',
      userCharacter: '',
      characters: []
    }
    this.login = this.login.bind(this)
    this.logout = this.logout.bind(this)
    this.loginSuccess = this.loginSuccess.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.fetchCharacters = this.fetchCharacters.bind(this)
  }
  login(event) {
    event.preventDefault()
    fetch('http://localhost:3002/user/' + this.state.userName)
      .then(response => response.json())
      .then(data => this.loginSuccess(data))
      .catch(e => console.log(e))
  }
  loginSuccess(data) {
    this.setState({ userId: data._id })
    this.setState({ userName: data.userName })
    this.setState({ userType: data.userType })
    this.setState({ userCharacter: data.character })
  }
  logout() {
    this.setState({ userId: '' })
    this.setState({ userType: 'guest' })
  }
  handleChange(event) {
    this.setState({ userName: event.target.value })
  }
  fetchCharacters() {
    fetch('http://localhost:3002/character/')
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            characters: result
          });
        })
  }
  render() {
    let loginForm = <li><form onSubmit={this.login}><input type="text" value={this.state.userName} onChange={this.handleChange}></input> <button type="submit">Kirjaudu</button></form></li>
    if (this.state.userId)
      loginForm = <li><button type="submit" onClick={this.logout}>Kirjaudu ulos</button></li>
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
            {loginForm}

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
              <PlayerDashboard loggedCharacter={this.state.userCharacter} characters={this.state.characters} fetchCharacters={this.fetchCharacters} />
            </Route>
            <Route path="/adminDashboard">
              <AdminDashboard characters={this.state.characters} fetchCharacters={this.fetchCharacters} />
            </Route>
          </Switch>
        </div>
      </Router>
    );
  }
}
export default App;






