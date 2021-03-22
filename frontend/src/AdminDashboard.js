// Import React dependencies.
import React, { Component } from 'react'
import { init, formatBlock, exec } from 'pell';
import { Link, Redirect } from "react-router-dom"
import 'pell/dist/pell.css'
import OpenChat from './OpenChat.js'

class AdminDashboard extends Component {
  constructor(props) {
    super(props);
    this.editCharacter = this.editCharacter.bind(this);
    this.deleteCharacter = this.deleteCharacter.bind(this)
    this.editUser = this.editUser.bind(this)
    this.deleteUser = this.deleteUser.bind(this)
  }
  editCharacter(e) {
    this.props.changeCharacter(this.props.characters.find(character => character._id === e.target.id))
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
    console.log("Admindashboard mounted")
    this.props.fetchCharacters()
    this.props.fetchPlayers()
  }
  render() {
    const characterName = (characters, id) => { if (id) { try { return characters.find(character => character._id === id).name } catch { return "-" } } else { return "-" } }
    const playerName = (players, id) => { if (id) { try { return players.find(player => player._id === id).userName } catch { return "-" } } else { return "-" } }
    const characters = this.props.characters.map((character) => <tr>
      <td>{character.name}</td><td>{playerName(this.props.players, character.player)}</td>
      <td><Link id={character._id} onClick={this.editCharacter} to="admin/newCharacter">Muokkaa</Link><button id={character._id} onClick={this.deleteCharacter}>Poista</button></td>
    </tr>);
    let players = ''
    if (this.props.players)
      players = this.props.players.map((player) => <tr>
        <td>{player.userName}</td>
        <td>{characterName(this.props.characters, player.character)}</td>
        <td>{player.login}</td>
        <td><Link id={player._id} onClick={this.editUser} to="admin/newUser">Muokkaa</Link><button id={player._id} onClick={this.deleteUser}>Poista</button></td>
      </tr>);
    return (
      <div>
        <Link to="admin/messages">Keskustelut</Link>
        <Link to="admin/newUser">Uusi käyttäjä</Link>
        <Link to="admin/newCharacter">Uusi hahmo</Link>
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
      actions: ['bold', 'underline', 'italic', 'heading1', 'heading2', 'ulist', {
        name: 'erase',
        icon: 'X',
        title: 'Poista muotoilut',
        result: () => {
          if (window.getSelection().toString()) {
            let linesToDelete = window.getSelection().toString().split('\n').join('<br>');
            exec(formatBlock, '<div>');
            document.execCommand('insertHTML', false, '<div>' + linesToDelete + '</div>');
          } else {
            exec(formatBlock, '<div>')
          }
        }
      },],
    })
    this.editor.content.innerHTML = this.props.html
  }
  render() {
    return (
      <div id="editor" className="pell" />
    )
  }
}

export class NewCharacter extends Component {
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
      plots: this.props.character.plots,
      redirect: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.checkInput = this.checkInput.bind(this)
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
        saldo: parseFloat(this.state.saldo),
        description: this.state.description,
        mechanics: this.state.mechanics,
        plots: this.state.plots
      })
      let newCharacterId
      let promise1, promise2 = null
      let url = "http://localhost:3002/character/"
      //Define later callbacks
      if (this.props.character.player !== this.state.player) {
        // Update selected user as well
        if (this.state.player) {
          const newPlayer = this.props.players.find(player => player._id === this.state.player)
          console.log("newPlayer ", newPlayer)
          promise1 = fetch('http://localhost:3002/user/' + this.state.player, {
            method: 'POST',
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ login: newPlayer.login, userName: newPlayer.userName, character: newCharacterId || this.props.character._id, userType: newPlayer.userType })
          })
        }
        if (this.props.character.player) {
          const oldPlayer = this.props.players.find(player => player._id === this.props.character.player)
          console.log("oldPlayer ", oldPlayer)
          //Remove character from old player
          promise2 = fetch('http://localhost:3002/user/' + oldPlayer._id, {
            method: 'POST',
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ login: oldPlayer.login, userName: oldPlayer.userName, character: '', userType: oldPlayer.userType })
          })
        }

      }
      if (this.props.character._id) {
        url += this.props.character._id
        // Insert/update character
        fetch(url, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json'
          },
          body: data
        })
          .then(response => response.json())
          .then(parsed => parsed.insertedId)
          .then(id => newCharacterId = id)
          .then(console.log("NewCharacterID " + newCharacterId))
          .then(Promise.all([promise1, promise2])
            .then(results => this.setState({ redirect: <Redirect to="/admin" /> }))
          )
      }
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
  componentDidMount() {
    if (this.props.players.length === 0)
      this.props.fetchPlayers()
  }
  componentWillUnmount() {
    this.props.clearSelectedCharacter()
  }
  render() {
    const players = this.props.players.map(player => <option value={player._id} key={player._id}>{player.userName}</option>)
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
          <Link to="/admin">Poistu tallentamatta</Link>
        </form>
        {this.state.redirect}
      </div>
    );
  }
}

export class MessageAdmin extends Component {
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
    this.updateCharacter = this.updateCharacter.bind(this)
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
        <button onClick={() => this.setState({ mode: "" })}>Takaisin</button>
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
          <Link to="/admin">Takaisin</Link><button onClick={() => this.setState({ mode: "new" })}>Uusi keskustelu</button>
          <ul>{chats}</ul>
        </div>
      )
    }
  }
}
export class NewUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      login: '',
      playerName: '',
      selectedCharacter: '',
      isLoaded: true,
      redirect: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }
  updateCharacter(response) {
    const existingUser = this.props.existingUser
    const characterId = this.state.selectedCharacter
    const selectedCharacter = this.props.characters.find(character => character._id === characterId)
    let oldCharacter
    let oldCharacterId = 0
    let userId
    let promise1, promise2 = null
    if (!existingUser)
      userId = JSON.parse(response).insertedId
    else {
      userId = existingUser._id
      oldCharacter = this.props.characters.find(character => character.player === userId)
      if (oldCharacter && oldCharacterId !== characterId)
        // Prevent removing current character
        oldCharacterId = oldCharacter._id
    }

    // If a character is chosen and it is not the same as before
    if (selectedCharacter && selectedCharacter.player !== userId) {
      //Update new character
      promise1 = fetch("http://localhost:3002/character/user/" + characterId, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ player: userId })
      })
    }
    // If there is a previous character and it is not the same as current or current is empty
    if (oldCharacterId) {
      // Remove player from previous character
      promise2 = fetch("http://localhost:3002/character/user/" + oldCharacterId, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ player: '' })
      })
    }
    Promise.all([promise1, promise2])
      .then(results => this.setState({ redirect: <Redirect to="/admin" /> }))

  }
  handleSubmit(event) {
    event.preventDefault();
    const data = { login: this.state.login, userName: this.state.playerName, character: this.state.selectedCharacter, userType: 'player' }
    let url = "http://localhost:3002/user/"
    if (this.props.existingUser)
      url += this.props.existingUser._id

    fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then(response => this.updateCharacter(response))
  }
  fillFields() {
    this.setState({
      login: this.props.existingUser.login,
      playerName: this.props.existingUser.userName,
      selectedCharacter: this.props.existingUser.character
    })
  }
  componentDidMount() {
    if (this.props.existingUser)
      this.fillFields()
  }
  componentWillUnmount() {
    this.props.clearSelectedUser()
  }
  render() {
    const characters = this.props.characters.map((character) => <option value={character._id}>{character.name}</option>)
    return (
      <div>
        <form onSubmit={this.handleSubmit}><br />
          <Link to="/admin">Takaisin</Link>
          <label>Kirjautumistunnus</label><input type="text" name="login" value={this.state.login} onChange={this.handleChange}></input><br />
          <label>Pelaajan nimi</label><input type="text" name="playerName" value={this.state.playerName} onChange={this.handleChange}></input><br />
          <label>Hahmo</label><select name="selectedCharacter" value={this.state.selectedCharacter} onChange={this.handleChange}><option value="-">-</option>{characters}</select><br />
          <button type="submit">Tallenna</button>
        </form>
        {this.state.redirect}
      </div>
    )
  }
}

export default AdminDashboard