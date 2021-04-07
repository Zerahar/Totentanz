
import { Component } from 'react'
import { BrowserRouter as Router, Route, Link, Switch, Redirect } from "react-router-dom";
import Home from './Home.js'
import Info from './Info.js'
import AdminDashboard from './AdminDashboard.js'
import { Pay, PlayerInfo, PlayerDashboard } from './PlayerDashboard.js'
import { NewCharacter, NewUser } from './AdminDashboard.js'
import ChatList from './ChatList.js'
import Transactions from './Transactions.js'
import { List, ChatDots } from 'react-bootstrap-icons'
import { Collapse, Dropdown, Toast } from 'bootstrap'
import './custom.scss'
import OpenChat from './OpenChat.js';
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
      selectedChat: '',
      nameSent: false,
      ready: false,
      notifMsg: '',
      notifSender: '',
      selectedCharacter: {
        name: '',
        age: '',
        gender: '',
        player: '',
        saldo: 0,
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
    this.fetchPlayers = this.fetchPlayers.bind(this)
    this.showError = this.showError.bind(this)
    this.ws = null
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
      .catch(error => this.showError(error))
  }
  login(event) {
    if (event)
      event.preventDefault()
    if (this.state.login) {
      fetch('http://localhost:3002/user/' + this.state.login)
        .then(response => {
          response.ok ? response.json().then(data => this.loginSuccess(data)) : this.showError(response.status)
        })
        .catch(error => this.showError(error))
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
    if (data.userType === "player") {
      this.setState({ redirect: <Redirect to="/dashboard" /> })
    }
    else {
      this.setState({ redirect: <Redirect to="/admin" /> })
    }
    this.ws = new WebSocket('ws://127.0.0.1:1337');
    this.ws.onclose = () => {
      console.log('disconnected')
    }
    this.ws.onmessage = evt => {
      // listen to data sent from the websocket server

      const message = JSON.parse(evt.data)
      console.log("Got a message: ", message)
      const toast = new Toast(document.getElementById("notifToast"))
      this.setState({
        notifMsg: message.data.text,
        notifSender: message.data.author
      }, toast.show())

    }
    this.ws.onopen = () => {
      console.log('connected')
      let user = this.state.characters.find(character => character._id === this.state.userCharacter)
      let userName
      if (user)
        userName = user.name
      else if (this.state.userType === "admin")
        userName = "admin"
      this.ws.send(JSON.stringify({ text: userName, type: 'new', id: this.state.userCharacter }))
      this.setState({ nameSent: true, ready: true })
    }
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
    this.ws.close()
  }
  handleChange(event) {
    this.setState({ login: event.target.value })
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
      .catch(error => this.showError(error))
  }
  showError(error, warning) {
    // Translate the most common error
    if (error.message === "NetworkError when attempting to fetch resource.")
      this.setState({ error: "Yhteyttä palvelimeen ei saatu. Yritä hetken kuluttua uudelleen tai ota yhteys pelinjohtoon." })
    // If the error is something else, show it anyway
    else
      this.setState({ error: error.message || error })
    // Show alert element
    const alert = document.getElementById("errorMessage")
    alert.classList.add('show')
    if (warning) {
      alert.classList.add("alert-warning")
      alert.classList.remove("alert-danger")
    }
    else {
      alert.classList.remove("alert-warning")
      alert.classList.add("alert-danger")
    }
    setTimeout(function () { alert.classList.remove('show') }, 7000);
  }
  changeChat(e) {
    console.log(e)
  }
  componentWillUnmount() {
    if (this.ws)
      this.ws.close()
  }
  render() {
    let loginForm = <li class="nav-item"><form onSubmit={this.login} class="w-100"><div class="input-group"><input type="text" value={this.state.login} onChange={this.handleChange} class="form-control"></input>
      <button type="submit" class="btn btn-primary">Kirjaudu</button>
    </div></form><span color="red">{this.state.warning}</span></li>
    if (this.state.userId)
      loginForm = <li class="nav-item"><button type="submit" onClick={this.logout} class="btn btn-primary">Kirjaudu ulos</button></li>
    let playerPage, adminPage = ""
    if (this.state.userType === "player")
      playerPage = <li class="nav-item">
        <Link to="/dashboard">Pelaajan sivut</Link>
      </li>
    if (this.state.userType === "admin")
      adminPage = <li class="nav-item">
        <Link to="/admin">Hallintapaneeli</Link>
      </li>
    return (
      <Router>
        <div class="navbar-container w-100">
          <nav class="navbar navbar-expand-lg main-nav container h-100">
            <div class="container-fluid">
              <Link class="navbar-brand" to="/">Totentanz</Link>
              <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbar" aria-controls="navbar" aria-expanded="false" aria-label="Valikko">
                <List />
              </button>
              <div class="collapse navbar-collapse justify-content-end" id="navbar">
                <ul class="navbar-nav">
                  <li class="nav-item">
                    <Link to="/info">Info</Link>
                  </li>
                  <li class="nav-item">
                    <Link to="/">Ilmoittaudu</Link>
                  </li>
                  {playerPage}
                  {adminPage}
                  {loginForm}

                </ul>
              </div>
            </div>
          </nav>
        </div>
        <div class="container h-100 p-0">
          <div class="alert alert-danger position-fixed bottom-0 start-50 translate-middle-x fade" id="errorMessage" role="alert">
            {this.state.error}
          </div>



          <Switch>
            <Route exact path="/">
              <Home />
            </Route>
            <Route exact path="/info">
              <Info />
            </Route>
            <Route exact path="/dashboard/info">
              <PlayerInfo character={this.state.characters.find(character => character._id === this.state.userCharacter)} />
            </Route>
            <Route exact path="/dashboard/pay">
              <Pay characters={this.state.characters} character={this.state.characters.find(character => character._id === this.state.userCharacter)} fetchCharacters={this.fetchCharacters} />
            </Route>
            <Route exact path="/dashboard/chat">
              <ChatList
                characters={this.state.characters}
                changeChat={e => this.setState({ selectedChat: e })}
                fetchCharacters={this.fetchCharacters}
                loggedCharacter={this.state.userCharacter}
                type={this.state.userType}
                error={this.showError}
              />
            </Route>
            <Route exact path="/dashboard">
              <PlayerDashboard loggedCharacter={this.state.userCharacter} characters={this.state.characters} fetchCharacters={this.fetchCharacters} />
            </Route>
            <Route exact path="/admin/newCharacter">
              <NewCharacter
                character={this.state.selectedCharacter}
                players={this.state.players}
                fetchPlayers={this.fetchPlayers}
                fetchCharacters={this.fetchCharacters}
                clearSelectedCharacter={() => this.setState({ selectedCharacter: this.state.defaultCharacter })}
                error={this.showError}
              />
            </Route>
            <Route exact path="/admin/newUser">
              <NewUser
                characters={this.state.characters}
                existingUser={this.state.players.find(player => player._id === this.state.selectedUser)}
                clearSelectedUser={() => this.setState({ selectedUser: '' })}
                fetchCharacters={this.fetchCharacters}
                fetchPlayers={this.fetchPlayers}
                error={this.showError}
              />
            </Route>
            <Route exact path="/admin/messages">
              <ChatList
                characters={this.state.characters}
                fetchCharacters={this.fetchCharacters}
                changeChat={e => this.setState({ selectedChat: e })}
                loggedCharacter={this.state.userCharacter}
                type={this.state.userType}
                error={this.showError}
              />
            </Route>
            <Route exact path="/admin/transactions">
              <Transactions
                characters={this.state.characters}
                fetchCharacters={this.fetchCharacters}
                error={this.showError}
              />
            </Route>
            <Route exact path="/admin">
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
                error={this.showError}
              />
            </Route>
            <Route exact path="/chat">
              <OpenChat
                chat={this.state.selectedChat}
                characterId={this.state.userCharacter}
                name={this.state.userType === "admin" ? "admin" : undefined}
                characters={this.state.characters}
                error={this.showError}
                ws={this.ws}
              />
            </Route>

          </Switch>
        </div>
        {this.state.redirect}
        <div id="notifToast" class="toast position-fixed bottom-0 end-0" role="alert" aria-live="assertive" aria-atomic="true">
          <div class="toast-header">
            <ChatDots />
            <strong class="me-auto">{this.state.notifSender}</strong>
            {/* <small>11 mins ago</small> */}
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
          </div>
          <div class="toast-body">
            {this.state.notifMsg}
          </div>
        </div>
      </Router>
    );
  }
}
export default App;






