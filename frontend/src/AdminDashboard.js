// Import React dependencies.
import React, { Component } from 'react'
import { init } from 'pell';

import 'pell/dist/pell.css'
import OpenChat from './OpenChat.js'

class CharacterMenu extends Component {
  constructor(props) {
    super(props);
    this.editCharacter = this.editCharacter.bind(this);
    this.deleteCharacter = this.deleteCharacter.bind(this)
    this.editUser = this.editUser.bind(this)
    this.deleteUser = this.deleteUser.bind(this)
  }
  editCharacter(e) {
    this.props.changeCharacter(e.target.id)
  }
  editUser(e) {
    this.props.changeUser(e.target.id)
  }
  deleteUser(e) {
    let c = window.confirm("Haluatko varmasti poistaa käyttäjän " + this.props.players.find(player => player._id === e.target.id).userName + "?")
    if (c) {
      fetch('http://localhost:3002/user/delete/' + e.target.id)
        .then(this.props.fetchPlayers())
    }
  }
  deleteCharacter(e) {
    let c = window.confirm("Haluatko varmasti poistaa hahmon " + this.props.characters.find(character => character._id === e.target.id).name + "?")
    if (c) {
      fetch('http://localhost:3002/character/delete/' + e.target.id)
        .then(this.props.fetchCharacters())
    }
  }
  componentDidMount() {
    if (this.props.characters.length === 0)
      this.props.fetchCharacters()
  }
  render() {
    const characterName = (characters, id) => { if (id) { try { return characters.find(character => character._id === id).name } catch { return "-" } } else { return "-" } }
    const playerName = (players, id) => { if (id) { try { return players.find(player => player._id === id).userName } catch { return "-" } } else { return "-" } }
    const characters = this.props.characters.map((character) => <tr>
      <td>{character.name}</td><td>{playerName(this.props.players, character.player)}</td>
      <td><button id={character._id} onClick={this.editCharacter}>Muokkaa</button><button id={character._id} onClick={this.deleteCharacter}>Poista</button></td>
    </tr>);
    let players = ''
    if (this.props.players)
      players = this.props.players.map((player) => <tr>
        <td>{player.userName}</td>
        <td>{characterName(this.props.characters, player.character)}</td>
        <td>{player.login}</td>
        <td><button id={player._id} onClick={this.editUser}>Muokkaa</button><button id={player._id} onClick={this.deleteUser}>Poista</button></td>
      </tr>);
    return (
      <div>
        <button onClick={this.props.switchMessages}>Keskustelut</button><button onClick={this.props.switchCharacter}>Uusi hahmo</button><button onClick={this.props.newUser}>Uusi käyttäjä</button>
        <h2>Hahmot</h2>
        <table>
          <thead>
            <tr><th>Nimi</th><th>Pelaaja</th><th>Operaatiot</th></tr>
          </thead>
          <tbody>
            {characters}
          </tbody>
        </table>

        <h2>Pelaajat</h2>
        <table>
          <thead>
            <tr><th>Oikea nimi</th><th>Hahmon nimi</th><th>Kirjautumistunnus</th><th>Operaatiot</th></tr>
          </thead>
          <tbody>
            {players}
          </tbody>
        </table>
      </div>
    );
  }
}

class Editor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      something: ''
    }
  }
  editor = null
  componentDidMount() {
    this.editor = init({
      element: document.getElementById('editor'),
      onChange: html => this.props.changeEditor(html),
      actions: ['bold', 'underline', 'italic', 'heading1', 'heading2', 'ulist'],
    })
    this.editor.content.innerHTML = this.props.html
  }
  render() {
    return (
      <div id="editor" className="pell" />
    )
  }
}

class NewCharacter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: this.props.character.name,
      age: this.props.character.age,
      gender: this.props.character.gender,
      player: this.props.character.player,
      saldo: this.props.character.saldo,
      description: this.props.character.description,
      mechanics: this.props.character.mechanics,
      plots: this.props.character.plots
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.checkInput = this.checkInput.bind(this)
    this.resetForm = this.resetForm.bind(this)
  }
  handleChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }
  handleSubmit(event) {
    event.preventDefault();
    if (this.checkInput()) {
      const data = JSON.stringify({
        name: this.state.name,
        age: this.state.age,
        gender: this.state.gender,
        player: this.state.player,
        saldo: this.state.saldo,
        description: this.state.description,
        mechanics: this.state.mechanics,
        plots: this.state.plots
      })
      let xhttp = new XMLHttpRequest();
      let url = "http://localhost:3002/character/"
      if (this.props.character._id)
        url += this.props.character._id
      xhttp.open("POST", url, true);
      xhttp.setRequestHeader("Content-type", "application/json");
      xhttp.onreadystatechange = (e) => { this.props.fetchCharacters(e); this.props.return("character") }
      xhttp.send(data);
    }
  }
  checkInput() {
    let valid = true
    if (!this.state.name)
      valid = false
    if (isNaN(this.state.saldo))
      valid = false
    return valid
  }
  resetForm() {
    this.setState({ name: '' })
    this.setState({ age: '' })
    this.setState({ gender: '' })
    this.setState({ player: '' })
    this.setState({ saldo: '' })
    this.setState({ description: '' })
    this.setState({ plots: '' })
    this.setState({ mechanics: '' })
    this.props.return()
  }

  render() {
    const players = this.props.players.map(player => <option value={player._id}>{player.userName}</option>)
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label>Nimi:</label> <input required type="text" value={this.state.name} onChange={this.handleChange} name="name"></input><br />
          <label>Ikä:</label> <input type="text" value={this.state.age} onChange={this.handleChange} name="age"></input><br />
          <label>Sukupuoli:</label> <input type="text" value={this.state.gender} onChange={this.handleChange} name="gender"></input><br />
          <label>Pelaaja:</label> <select value={this.state.player} onChange={this.handleChange} name="player">
            <option value="" >-</option>{players}</select><br />
          <label>Saldo:</label> <input placeholder="0" type="text" value={this.state.saldo} onChange={this.handleChange} name="saldo"></input><br />
          <label>Kuvaus: </label><br />
          <Editor changeEditor={(data) => this.setState({ description: data })} html={this.state.description} />
          <label>Juonet: </label><br />
          <Editor changeEditor={(data) => this.setState({ plots: data })} html={this.state.plots} />
          <label>Pelimekaniikat: </label><br />
          <Editor changeEditor={(data) => this.setState({ mechanics: data })} html={this.state.mechanics} />
          <button type="submit" onClick={this.handleSubmit}>Tallenna</button>
          <button type="reset" onClick={this.resetForm}>Poistu tallentamatta</button>
        </form>
      </div>
    );
  }
}

class Messages extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chats: [],
      selectedChat: '',
      mode: '',
      isLoaded: true,
      selectedCharacters: []
    };
    this.fetchChats = this.fetchChats.bind(this)
    this.deleteChat = this.deleteChat.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.createChat = this.createChat.bind(this)
  }
  componentDidMount() {
    this.fetchChats()
  }
  fetchChats() {
    fetch('http://localhost:3002/chat/')
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({ chats: result, isLoaded: true });
        }
      )
  }
  deleteChat(e) {
    let c = window.confirm("Haluatko varmasti poistaa keskustelun?")
    if (c)
      fetch('http://localhost:3002/chat/delete/' + e.target.id)
        .then(this.fetchChats())
  }
  createChat() {
    const data = { participants: this.state.selectedCharacters }
    let xhttp = new XMLHttpRequest();
    xhttp.open("POST", "http://localhost:3002/chat/", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.onreadystatechange = (e) => this.fetchChats(e)
    xhttp.send(JSON.stringify(data));
    this.setState({ mode: '', selectedCharacters: [] })
  }
  handleChange(event) {
    if (event.target.checked)
      this.setState(prevState => ({ selectedCharacters: [...prevState.selectedCharacters, this.props.characters.find(character => character._id === event.target.name)] }))
    else {
      let filteredArray = this.state.selectedCharacters.filter(character => character._id !== event.target.name)
      this.setState({ selectedCharacters: filteredArray })
    }
  }
  render() {
    const characters = this.props.characters.map((character) => <li><input type="checkbox" name={character._id} onChange={this.handleChange} />{character.name}</li>)
    const chats = this.state.chats.map((chat) => <li>
      {chat.participants.map((participant) => participant.name + ", ")}
      <button onClick={() => this.setState({ mode: "open", selectedChat: chat })}>Avaa</button>
      <button onClick={this.deleteChat} id={chat._id}>Poista</button>
    </li>);
    if (this.state.mode === "new") {
      return (<div>
        <label>Valitse keskustelun jäsenet</label>
        <ul>
          {characters}
        </ul>
        <button onClick={this.createChat}>Luo keskustelu</button>
      </div>)
    }
    else if (this.state.mode === "open") {
      return (
        <OpenChat chat={this.state.selectedChat} user="admin" />
      )
    }
    else {
      return (
        <div>
          <button onClick={this.props.return}>Takaisin</button><button onClick={() => this.setState({ mode: "new" })}>Uusi keskustelu</button>
          <ul>{chats}</ul>
        </div>
      )
    }
  }
}
class NewUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      login: '',
      playerName: '',
      selectedCharacter: '',
      isLoaded: true
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.resetForm = this.resetForm.bind(this)
  }
  handleChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }
  handleSubmit(event) {
    event.preventDefault();
    const data = { login: this.state.login, userName: this.state.playerName, character: this.state.selectedCharacter, userType: 'player' }
    let xhttp = new XMLHttpRequest();
    let url = "http://localhost:3002/user/"
    if (this.props.existingUser)
      url += this.props.existingUser._id
    xhttp.open("POST", url, true);
    xhttp.setRequestHeader("Content-type", "application/json");
    if (this.state.selectedCharacter) {
      const existingUser = this.props.existingUser
      const characterId = this.state.selectedCharacter
      const selectedCharacter = this.props.characters.find(character => character._id === characterId)

      xhttp.onreadystatechange = function () {
        let userId
        if (this.readyState == 4 && this.status == 200) {
          if (!existingUser)
            userId = JSON.parse(this.response).insertedId
          else
            userId = existingUser._id

          // Check that character has player as well
          if (!selectedCharacter.player) {
            xhttp.open("POST", "http://localhost:3002/character/user/" + characterId, true);
            xhttp.setRequestHeader("Content-type", "application/json");
            xhttp.send(JSON.stringify({ player: userId }));
          }
          this.props.return("user")
        }
      }
    }
    else {
      xhttp.onreadystatechange = () => this.props.return("user")
    }
    xhttp.send(JSON.stringify(data))
  }
  fillFields() {
    this.setState({
      login: this.props.existingUser.login,
      playerName: this.props.existingUser.userName,
      selectedCharacter: this.props.existingUser.character
    })
  }
  resetForm(e) {
    e.preventDefault()
    this.setState({
      login: '',
      playerName: '',
      selectedCharacter: ''
    })
    this.props.return()
  }
  componentDidMount() {
    if (this.props.existingUser)
      this.fillFields()
  }
  render() {
    const characters = this.props.characters.map((character) => <option value={character._id}>{character.name}</option>)
    return (
      <div>
        <form onSubmit={this.handleSubmit}><br />
          <button type="reset" onClick={this.resetForm}>Takaisin</button>
          <label>Kirjautumistunnus</label><input type="text" name="login" value={this.state.login} onChange={this.handleChange}></input><br />
          <label>Pelaajan nimi</label><input type="text" name="playerName" value={this.state.playerName} onChange={this.handleChange}></input><br />
          <label>Hahmo</label><select name="selectedCharacter" value={this.state.selectedCharacter} onChange={this.handleChange}><option value="-">-</option>{characters}</select><br />
          <button type="submit">Tallenna</button>
        </form>
      </div>
    )
  }
}

class AdminDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: null,
      selectedCharacter: null,
      selectedUser: null,
      players: []
    }
    this.changeCharacter = this.changeCharacter.bind(this);
    this.fetchPlayers = this.fetchPlayers.bind(this)
    this.changeUser = this.changeUser.bind(this)
    this.return = this.return.bind(this)
  }
  componentDidMount() {
    this.fetchPlayers()
  }
  fetchPlayers() {
    fetch('http://localhost:3002/user/')
      .then(res => res.json())
      .then(data => this.setState({ players: data }))
  }
  changeCharacter(id) {
    this.setState({ selectedCharacter: id })
    this.setState({ mode: "new" })
  }
  changeUser(id) {
    this.setState({ selectedUser: this.state.players.find(player => player._id === id) })
    this.setState({ mode: "user" })
  }
  return(type) {
    this.setState({
      mode: '',
      selectedCharacter: ''
    })
    if (type === "user")
      this.fetchPlayers()
    if (type === "character")
      this.props.fetchCharacters()
  }
  render() {
    let tab
    let returnCharacter = {
      name: '',
      age: '',
      gender: '',
      player: '',
      saldo: '',
      description: '',
      mechanics: '',
      plots: ''
    }
    if (this.state.selectedCharacter)
      returnCharacter = this.props.characters.find(character => character._id === this.state.selectedCharacter)
    switch (this.state.mode) {
      case "new": tab = <NewCharacter character={returnCharacter} return={this.return} players={this.state.players} />; break;
      case "messages": tab = <Messages return={this.return} characters={this.props.characters} />; break;
      case "user": tab = <NewUser characters={this.props.characters} existingUser={this.state.selectedUser} return={this.return} />; break;
      default: tab = <CharacterMenu
        players={this.state.players}
        fetchPlayers={this.fetchPlayers}
        characters={this.props.characters}
        fetchCharacters={this.props.fetchCharacters}
        selectedCharacter={this.state.selectedCharacter}
        changeCharacter={this.changeCharacter}
        newUser={() => this.setState({ mode: 'user' })}
        switchCharacter={() => this.setState({ mode: "new" })}
        switchMessages={() => this.setState({ mode: "messages" })}
        changeUser={this.changeUser} />
    }
    return (
      <div>
        <h2>Dashboard</h2>

        {tab}
      </div>
    );
  }
}

export default AdminDashboard