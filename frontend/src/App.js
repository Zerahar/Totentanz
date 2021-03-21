import './App.css';
import { Component } from 'react'
import { BrowserRouter as Router, Route, Link, Switch, Redirect } from "react-router-dom";
import Home from './Home.js'
import Info from './Info.js'
import AdminDashboard from './AdminDashboard.js'
import { Pay, PlayerInfo, Message, PlayerDashboard } from './PlayerDashboard.js'
import { NewCharacter, NewUser, MessageAdmin } from './AdminDashboard.js'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: '',
      userName: '',
      login: '',
      userType: 'guest',
      userCharacter: '',
      characters: [],
      warning: '',
      selectedCharacter: {
        name: '',
        age: '',
        gender: '',
        player: '',
        saldo: '',
        description: '',
        mechanics: '',
        plots: ''
      },
      selectedUser: '',
      players: [],
      defaultCharacter: {
        name: '',
        age: '',
        gender: '',
        player: '',
        saldo: '',
        description: '',
        mechanics: '',
        plots: ''
      }
    }

    this.login = this.login.bind(this)
    this.logout = this.logout.bind(this)
    this.loginSuccess = this.loginSuccess.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.fetchCharacters = this.fetchCharacters.bind(this)
    this.handleError = this.handleError.bind(this)
    this.fetchPlayers = this.fetchPlayers.bind(this)
  }
  componentDidMount() {
    // Check if login cookie
    const cookies = decodeURIComponent(document.cookie)
    const cookieArray = cookies.split(';')
    cookieArray.forEach(cookie => {
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1);
      }
      if (cookie.indexOf("login") === 0) {
        this.setState({ login: cookie.substring(6) }, () => this.login())
      }
    });
  }
  fetchPlayers() {
    fetch('http://localhost:3002/user/')
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            players: result
          });
        })
  }
  login(event) {
    if (event)
      event.preventDefault()
    if (this.state.login) {
      fetch('http://localhost:3002/user/' + this.state.login)
        .then(response => {
          response.ok ? response.json().then(data => this.loginSuccess(data)) : this.handleError(response.status)
        })
    }
  }
  loginSuccess(data) {
    this.setState({
      userId: data._id,
      userName: data.userName,
      userType: data.userType,
      userCharacter: data.character,
      warning: ''
    })
    // create a cookie
    document.cookie = "login=" + this.state.login
  }
  logout() {
    this.setState({
      userId: '',
      userType: 'guest',
      userCharacter: '',
      login: '',
      userId: ''
    })
    // Remove login cookie
    document.cookie = "login="
  }
  handleChange(event) {
    this.setState({ login: event.target.value })
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
    let loginForm = <li><form onSubmit={this.login}><input type="text" value={this.state.login} onChange={this.handleChange}></input> <button type="submit">Kirjaudu</button><br />
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
              <Pay characters={this.state.characters} character={this.state.characters.find(character => character._id === this.state.userCharacter)} fetchCharacters={this.fetchCharacters} />
            </Route>
            <Route exact path="/dashboard/chat">
              <Message characters={this.state.characters} loggedCharacter={this.state.userCharacter} />
            </Route>
            <Route path="/dashboard">
              <PlayerDashboard loggedCharacter={this.state.userCharacter} characters={this.state.characters} fetchCharacters={this.fetchCharacters} />
            </Route>
            <Route exact path="/admin/newCharacter">
              <NewCharacter
                character={this.state.selectedCharacter}
                players={this.state.players}
                fetchPlayers={this.fetchPlayers}
                clearSelectedCharacter={() => this.setState({ selectedCharacter: this.state.defaultCharacter })}
              />
            </Route>
            <Route exact path="/admin/newUser">
              <NewUser
                characters={this.state.characters}
                existingUser={this.state.players.find(player => player._id === this.state.selectedUser)}
                clearSelectedUser={() => this.setState({ selectedUser: '' })}
              />
            </Route>
            <Route exact path="/admin/messages">
              <MessageAdmin characters={this.state.characters} />
            </Route>
            <Route path="/admin">
              <AdminDashboard
                characters={this.state.characters}
                fetchCharacters={this.fetchCharacters}
                selectCharacter={e => this.setState({ selectedCharacter: e.target.id })}
                selectUser={e => this.setState({ selectedUser: e.target.id })}
                players={this.state.players}
                fetchPlayers={this.fetchPlayers}
                changeCharacter={e => this.setState({ selectedCharacter: e })}
                changeUser={e => this.setState({ selectedUser: e })} />
            </Route>

          </Switch>
        </div>
      </Router>
    );
  }
}
export default App;






