
import { Component } from 'react'
import { BrowserRouter as Router, Route, Link, Switch, Redirect } from "react-router-dom";
import Home from './Home.js'
import Info from './Info.js'
import AdminDashboard from './AdminDashboard.js'
import { Pay, PlayerInfo, Message, PlayerDashboard } from './PlayerDashboard.js'
import { NewCharacter, NewUser, MessageAdmin } from './AdminDashboard.js'
import Transactions from './Transactions.js'
import './custom.scss'

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
    console.log("Fetching players")
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
    if (data.userType === "player")
      this.setState({ redirect: <Redirect to="/dashboard" /> })
  }
  logout() {
    this.setState({
      userId: '',
      userType: 'guest',
      userCharacter: '',
      login: '',
      redirect: <Redirect to="/" />
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
    console.log("Fetch characters")
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
    let loginForm = <li class="nav-item"><form onSubmit={this.login}><input type="text" value={this.state.login} onChange={this.handleChange} class="form-control"></input>
      <button type="submit" class="btn btn-primary">Kirjaudu</button>
    </form><span color="red">{this.state.warning}</span></li>
    if (this.state.userId)
      loginForm = <li class="nav-item"><button type="submit" onClick={this.logout} class="btn btn-primary">Kirjaudu ulos</button></li>
    return (
      <Router>
        <div class="container h-100">
          <nav class="navbar navbar-expand-md main-nav">
            <div class="container-fluid">
              <a class="navbar-brand" href="/">Totentanz</a>
              <div class="collapse navbar-collapse" id="navbar">
                <ul class="navbar-nav">
                  <li class="nav-item">
                    <Link to="/">Home</Link>
                  </li>
                  <li class="nav-item">
                    <Link to="/info">Info</Link>
                  </li>
                  <li class="nav-item">
                    <Link to="/dashboard">Dashboard</Link>
                  </li>
                  <li class="nav-item">
                    <Link to="/admin">Dashboard (Admin)</Link>
                  </li>
                  {loginForm}

                </ul>
              </div>
              <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbar" aria-controls="navbar" aria-expanded="false" aria-label="Valikko">
                <span class="navbar-toggler-icon"></span>
              </button></div>
          </nav>

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
                fetchCharacters={this.fetchCharacters}
                clearSelectedCharacter={() => this.setState({ selectedCharacter: this.state.defaultCharacter })}
              />
            </Route>
            <Route exact path="/admin/newUser">
              <NewUser
                characters={this.state.characters}
                existingUser={this.state.players.find(player => player._id === this.state.selectedUser)}
                clearSelectedUser={() => this.setState({ selectedUser: '' })}
                fetchCharacters={this.fetchCharacters}
                fetchPlayers={this.fetchPlayers}
              />
            </Route>
            <Route exact path="/admin/messages">
              <MessageAdmin
                characters={this.state.characters}
                fetchCharacters={this.fetchCharacters} />
            </Route>
            <Route exact path="/admin/transactions">
              <Transactions
                characters={this.state.characters}
                fetchCharacters={this.fetchCharacters}
              />
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
                changeUser={e => this.setState({ selectedUser: e })}
                admin={this.state.userType}
              />
            </Route>

          </Switch>
        </div>
        {this.state.redirect}
      </Router>
    );
  }
}
export default App;






