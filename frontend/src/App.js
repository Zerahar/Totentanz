import './App.css';
import { Component } from 'react'
import { BrowserRouter as Router, Route, Link, Switch, Redirect } from "react-router-dom";
import Home from './Home.js'
import Info from './Info.js'
import AdminDashboard from './AdminDashboard.js'
import { Pay, PlayerInfo, Message, PlayerDashboard } from './PlayerDashboard.js'
import { NewCharacter } from './AdminDashboard.js'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: '',
      userName: '',
      userType: 'guest',
      userCharacter: '',
      characters: [],
      warning: ''
    }
    this.login = this.login.bind(this)
    this.logout = this.logout.bind(this)
    this.loginSuccess = this.loginSuccess.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.fetchCharacters = this.fetchCharacters.bind(this)
    this.handleError = this.handleError.bind(this)
  }
  login(event) {
    event.preventDefault()
    if (this.state.userName)
      fetch('http://localhost:3002/user/' + this.state.userName)
        .then(response => {
          response.ok ? response.json().then(data => this.loginSuccess(data)) : this.handleError(response.status)
        })
  }
  loginSuccess(data) {
    this.setState({
      userId: data._id,
      userName: data.userName,
      userType: data.userType,
      userCharacter: data.character,
      warning: ''
    })
  }
  logout() {
    this.setState({ userId: '' })
    this.setState({ userType: 'guest' })
  }
  handleChange(event) {
    this.setState({ userName: event.target.value })
  }
  handleError(error) {
    if (error === 404)
      this.setState({ warning: "Väärä tunnus" })
    if (error === 500)
      this.setState({ warning: "Palvelimella on ongelma. Ota yhteys ylläpitäjään." })
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
    let loginForm = <li><form onSubmit={this.login}><input type="text" value={this.state.userName} onChange={this.handleChange}></input> <button type="submit">Kirjaudu</button><br />
    </form><span color="red">{this.state.warning}</span></li>
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
              <Link to="/dashboard">Dashboard</Link>
            </li>
            <li>
              <Link to="/admin">Dashboard (Admin)</Link>
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
            <Route exact path="/dashboard/info">
              <PlayerInfo character={this.state.characters.find(character => character._id === this.state.userCharacter)} />
            </Route>
            <Route exact path="/dashboard/pay">
              <Pay characters={this.state.characters} character={this.state.characters.find(character => character._id === this.state.userCharacter)} return={this.return} />
            </Route>
            <Route exact path="/dashboard/chat">
              <Message characters={this.state.characters} loggedCharacter={this.state.userCharacter} />
            </Route>
            <Route path="/dashboard">
              <PlayerDashboard loggedCharacter={this.state.userCharacter} characters={this.state.characters} fetchCharacters={this.fetchCharacters} />
            </Route>
            <Route path="/admin">
              <AdminDashboard characters={this.state.characters} fetchCharacters={this.fetchCharacters} />
            </Route>
          </Switch>
        </div>
      </Router>
    );
  }
}
export default App;






