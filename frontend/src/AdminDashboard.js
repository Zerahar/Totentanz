// Import React dependencies.
import React, { Component, useMemo, useState, useEffect } from 'react'
// Import the Slate editor factory.
import { createEditor } from 'slate'
// Import the Slate components and React plugin.
import { Slate, Editable, withReact } from 'slate-react'
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
    fetch('http://localhost:3002/user/delete/' + e.target.id)
    this.props.fetchPlayers()
  }
  deleteCharacter(e) {
    fetch('http://localhost:3002/character/delete/' + e.target.id)
    this.props.fetchCharacters()
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

function Editor(props) {
  const editor = useMemo(() => withReact(createEditor()), [])
  const [value, setValue] = useState([
    {
      type: 'paragraph',
      children: [{ text: props.content }],
    },
  ])
  useEffect(() => {
    if (value !== props.content)
      props.onChange(value)
  });

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={value => setValue(value)}
    >
      <Editable />
    </Slate>
  );
}


class NewCharacter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      age: '',
      gender: '',
      player: '',
      saldo: '',
      description: 'Hahmon kuvaus',
      mechanics: 'Pelimekaniikat',
      plots: 'Juonet'
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onDescriptionChange = this.onDescriptionChange.bind(this);
    this.onPlotsChange = this.onPlotsChange.bind(this);
    this.onMechanicsChange = this.onMechanicsChange.bind(this);
    this.resetForm = this.resetForm.bind(this)
  }
  componentDidMount() {
    if (this.props.selectedCharacter) {
      fetch('http://localhost:3002/character/' + this.props.selectedCharacter)
        .then(response => response.json())
        .then(blob => this.fillFields(blob))
    }
  }
  fillFields(data) {
    this.setState({ name: data.name })
    this.setState({ age: data.age })
    this.setState({ gender: data.gender })
    this.setState({ player: data.player })
    this.setState({ saldo: data.saldo })
    this.setState({ description: data.description })
    this.setState({ plots: data.plots })
    this.setState({ mechanics: data.mechanics })
  }
  handleChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }
  onDescriptionChange(content) {
    this.setState({
      description: content
    });
  }
  onPlotsChange(content) {
    this.setState({
      plots: content
    });
  }
  onMechanicsChange(content) {
    this.setState({
      mechanics: content
    });
  }
  handleSubmit(event) {
    event.preventDefault();
    const data = JSON.stringify(this.state)
    let xhttp = new XMLHttpRequest();
    let url = "http://localhost:3002/character/"
    if (this.props.selectedCharacter)
      url += this.props.selectedCharacter
    xhttp.open("POST", url, true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(data);
    this.props.fetchCharacters()
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
        <button onClick={this.resetForm}>Takaisin</button>
        <form onSubmit={this.handleSubmit}>
          <label>Nimi:</label> <input type="text" value={this.state.name} onChange={this.handleChange} name="name"></input><br />
          <label>Ikä:</label> <input type="text" value={this.state.age} onChange={this.handleChange} name="age"></input><br />
          <label>Sukupuoli:</label> <input type="text" value={this.state.gender} onChange={this.handleChange} name="gender"></input><br />
          <label>Pelaaja:</label> <select value={this.state.player} onChange={this.handleChange} name="player">
            <option value="" >-</option>{players}</select><br />
          <label>Saldo:</label> <input type="text" value={this.state.saldo} onChange={this.handleChange} name="saldo"></input><br />
          <label>Kuvaus: </label>
          <Editor content={this.state.description} onChange={this.onDescriptionChange} />
          <label>Juonet: </label>
          <Editor content={this.state.plots} onChange={this.onPlotsChange} />
          <label>Pelimekaniikat: </label>
          <Editor content={this.state.mechanics} onChange={this.onMechanicsChange} />
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
  fetchChats(e) {
    console.log("Fetching chats")
    fetch('http://localhost:3002/chat/')
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({ chats: result, isLoaded: true });
        }
      )
  }
  deleteChat(e) {
    fetch('http://localhost:3002/chat/delete/' + e.target.id)
      .then(response => this.fetchChats())
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
        }
      }

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
  componentDidMount() {
    if (this.props.existingUser)
      this.fillFields()
  }
  render() {
    const characters = this.props.characters.map((character) => <option value={character._id}>{character.name}</option>)
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
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
  return() {
    this.setState({ mode: null })
    this.setState({ selectedCharacter: null })
  }
  render() {
    let tab
    switch (this.state.mode) {
      case "new": tab = <NewCharacter selectedCharacter={this.state.selectedCharacter} fetchCharacters={this.props.fetchCharacters} return={this.return} players={this.state.players} />; break;
      case "messages": tab = <Messages return={this.return} characters={this.props.characters} />; break;
      case "user": tab = <NewUser characters={this.props.characters} existingUser={this.state.selectedUser} />; break;
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