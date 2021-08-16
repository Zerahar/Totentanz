
import { Component } from 'react'
import { HashRouter as Router, Route, Link, Switch, Redirect } from "react-router-dom";
import Home from './Home.js'
import Info from './Info.js'
import AdminDashboard from './AdminDashboard.js'
import { Pay, PlayerInfo, PlayerDashboard } from './PlayerDashboard.js'
import { NewCharacter, NewUser } from './AdminDashboard.js'
import ChatList from './ChatList.js'
import Transactions from './Transactions.js'
import { List, ChatDots, Download } from 'react-bootstrap-icons'
import { Collapse, Dropdown, Toast } from 'bootstrap'
import '../css/custom.scss'
import OpenChat from './OpenChat.js';
const { REACT_APP_SERVER_URL, REACT_APP_WS_SERVER_URL } = process.env;
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
        saldo: 0,
        description: '',
        mechanics: '',
        plots: ''
      },
      loading: false
    }

    this.login = this.login.bind(this)
    this.logout = this.logout.bind(this)
    this.loginSuccess = this.loginSuccess.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.fetchCharacters = this.fetchCharacters.bind(this)
    this.fetchPlayers = this.fetchPlayers.bind(this)
    this.showError = this.showError.bind(this)
    this.ws = null
    this.closeMenu = this.closeMenu.bind(this)
    this.setReady = this.setReady.bind(this)
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
        return;
      }
    })
    this.fetchCharacters()
  }
  fetchPlayers() {
    console.log("Fetching players")
    fetch(REACT_APP_SERVER_URL + "user/", { headers: { 'Access-Control-Allow-Origin': 'https://totentanz.herokuapp.com' } })
      .then(res => res.json())
      .then(result => result.filter(a => a.userType == "player"))
      .then(result => result.sort(function (a, b) { return a.userName > b.userName })) // Sort by player name
      .then(
        (result) => {
          // Save into state
          this.setState({
            players: result,
            loading: false
          });
        })
      .catch(error => this.showError(error, "danger"))
  }
  login(event) {
    if (event)
      event.preventDefault()
    if (this.state.login) {
      fetch(REACT_APP_SERVER_URL + "user/" + this.state.login, { headers: { 'Access-Control-Allow-Origin': 'https://totentanz.herokuapp.com' } })
        .then(response => {
          response.ok ? response.json().then(data => this.loginSuccess(data)) : this.showError("Kirjautuminen ei onnistunut. Tarkista oikeinkirjoitus.", "warning")
        })
        .catch(error => this.showError(error, "danger"))
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
    this.ws = null
    try {
      this.ws = new WebSocket(REACT_APP_WS_SERVER_URL);
    } catch (e) {
      console.log("Websocket init failed. Error: " + e)
      this.showError("Yhteyttä chat-palveluun ei saatu muodostettua. Pikaviestit eivät välttämättä toimi.", "danger")
    }
    this.ws.onclose = () => {
      console.log('disconnected')
    }
    this.ws.onmessage = evt => {
      // listen to data sent from the websocket server
      // But don't show notification if chat is open
      const message = JSON.parse(evt.data)
      console.log("Got a message: ", message)
      if (this.state.selectedChat !== message.data.chat) {
        const toast = new Toast(document.getElementById("notifToast"))
        this.setState({
          notifMsg: message.data.text,
          notifSender: message.data.author
        }, toast.show())
      }
    }
    this.ws.onopen = () => {
      console.log('connected')
      // Find username, either character name or "admin"
      let user = this.state.characters.find(character => character._id === this.state.userCharacter)
      let userName
      if (user)
        userName = user.name
      else if (this.state.userType === "admin")
        userName = "admin"
      // If user has no character assigned, they cannot participate in chat
      else {
        console.log("No character assigned, closing websocket")
        this.ws.close()
      }
      // Send username to the websocket
      if (userName && this.ws && this.ws.readyState === 1) {
        this.ws.send(JSON.stringify({ text: userName, type: 'new', id: this.state.userCharacter }))
        this.setState({ nameSent: true, ready: true })
      }
    }
    this.ws.onerror = (e) => this.showError(e, "danger")
  }
  logout() {
    this.setState({
      userId: '',
      userType: 'guest',
      userCharacter: '',
      login: '',
      loading: false,
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
    fetch(REACT_APP_SERVER_URL + "character/", { headers: { 'Access-Control-Allow-Origin': 'https://totentanz.herokuapp.com' } })
      .then(res => res.json())
      .then(result => result.sort(function (a, b) { return a.name > b.name })) // Sort by character name
      .then(
        (result) => {
          // Save in state
          this.setState({
            characters: result,
            loading: false
          });
        })
      .catch(error => this.showError(error, "danger"))
  }
  showError(message, type) {
    console.log("Showing error ", message)
    // Prevent forever loading state
    this.setState({ loading: false })
    // Translate the most common errors
    switch (message.message) {
      case "NetworkError when attempting to fetch resource.":
      case "Failed to fetch":
        this.setState({ error: "Yhteyttä palvelimeen ei saatu. Yritä hetken kuluttua uudelleen tai ota yhteys pelinjohtoon." }); break;
      default:
        this.setState({ error: "Sovellus kohtasi virheen. Yritä hetken kuluttua uudelleen tai ota yhteys pelinjohtoon." }); break;
    }
    // Show alert element
    const alert = document.getElementById("errorMessage")
    alert.className = "alert position-fixed bottom-0 start-50 translate-middle-x fade show"
    switch (type) {
      case "warning": alert.classList.add("alert-warning"); break;
      case "danger": alert.classList.add("alert-danger"); break;
      case "success": alert.classList.add("alert-success"); break;
      default: break;
    }
    setTimeout(function () { alert.classList.remove('show') }, 7000);
  }
  closeMenu() {
    // Only needed when using mid-size or smaller screen, since then a collapsing navbar will be used
    if (window.screen.width < 992) {
      const navbar = document.getElementById("navbar")
      const collapse = new Collapse(navbar)
      collapse.hide()
    }
  }
  setReady(state) {
    if (state)
      this.setState({ loading: false })
    else
      this.setState({ loading: true })
  }
  componentWillUnmount() {
    if (this.ws)
      this.ws.close()
  }
  render() {
    let loginForm = <li class="nav-item">
      <form onSubmit={(e) => this.login(e)} class="w-100">
        <div class="input-group">
          <label for="login-input" class="visually-hidden">Kirjaudu sisään</label>
          <input id="login-input" type="text" value={this.state.login} onChange={this.handleChange} class="form-control"></input>
          <button type="submit" class="btn btn-primary">Kirjaudu</button>
        </div></form></li>
    if (this.state.userId)
      loginForm = <li class="nav-item"><button type="submit" onClick={this.logout} class="btn btn-primary">Kirjaudu ulos</button></li>
    let playerPage, adminPage = ""
    if (this.state.userType === "player")
      playerPage = <li class="nav-item">
        <Link to="/dashboard" onClick={() => this.closeMenu()}>Pelaajan sivut</Link>
      </li>
    if (this.state.userType === "admin")
      adminPage = <li class="nav-item">
        <Link to="/admin" onClick={() => this.closeMenu()}>Hallintapaneeli</Link>
      </li>
    let loading
    if (this.state.loading)
      loading = <div class="spinner-border position-absolute top-50 start-50 loading " role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    return (
      <Router>
        <header class="navbar-container w-100">
          <nav class="navbar navbar-expand-lg main-nav container h-100">
            <div class="container-fluid">
              <Link class="navbar-brand" to="/">Totentanz</Link>
              <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbar" aria-controls="navbar" aria-expanded="false" aria-label="Valikko">
                <List />
              </button>
              <div class="collapse navbar-collapse justify-content-end" id="navbar">
                <ul class="navbar-nav">
                  <li class="nav-item">
                    <Link to="/info" onClick={() => this.closeMenu()}>Info</Link>
                  </li>
                  <li class="nav-item">
                    <Link to="/" onClick={() => this.closeMenu()}>Ilmoittaudu</Link>
                  </li>
                  {playerPage}
                  {adminPage}
                  {loginForm}

                </ul>
              </div>
            </div>
          </nav>
        </header>
        {loading}
        <div class="w-100 p-0">
          <div
            class="alert alert-danger position-fixed bottom-0 start-50 translate-middle-x fade hidden"
            id="errorMessage"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            {this.state.error}
          </div>
          {/* <div class="install-button position-fixed" id="install-app">
            <Download />
          </div> */}

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
              <Pay
                characters={this.state.characters}
                character={this.state.characters.find(character => character._id === this.state.userCharacter)}
                fetchCharacters={this.fetchCharacters}
                isReady={this.setReady}
                error={this.showError} />
            </Route>
            <Route exact path="/dashboard/chat">
              <ChatList
                characters={this.state.characters}
                changeChat={e => this.setState({ selectedChat: e })}
                fetchCharacters={this.fetchCharacters}
                loggedCharacter={this.state.userCharacter}
                type={this.state.userType}
                error={this.showError}
                isReady={this.setReady}
              />
            </Route>
            <Route exact path="/dashboard">
              <PlayerDashboard
                loggedCharacter={this.state.userCharacter}
                characters={this.state.characters}
                fetchCharacters={this.fetchCharacters}
                userType={this.state.userType} />
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
                isReady={this.setReady}
              />
            </Route>
            <Route exact path="/admin/transactions">
              <Transactions
                characters={this.state.characters}
                fetchCharacters={this.fetchCharacters}
                error={this.showError}
                isReady={this.setReady}
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
                isReady={this.setReady}
                clear={() => this.setState({ selectedChat: '' })}
              />
            </Route>

          </Switch>
        </div>
        {this.state.redirect}
        <div id="notifToast" class="toast position-fixed" role="alert" aria-live="assertive" aria-atomic="true">
          <div class="toast-header">
            <ChatDots />
            <strong class="me-auto ml-1">{this.state.notifSender}</strong>
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






