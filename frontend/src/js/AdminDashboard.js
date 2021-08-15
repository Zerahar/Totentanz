// Import React dependencies.
import React, { Component } from 'react'
import { init, formatBlock, exec } from 'pell';
import { Link, Redirect } from "react-router-dom"
import 'pell/dist/pell.css'
const { REACT_APP_SERVER_URL } = process.env;
class AdminDashboard extends Component {
  constructor(props) {
    super(props);
    this.editCharacter = this.editCharacter.bind(this);
    this.deleteCharacter = this.deleteCharacter.bind(this)
    this.editUser = this.editUser.bind(this)
    this.deleteUser = this.deleteUser.bind(this)
    this.success = this.success.bind(this)
  }
  editCharacter(e) {
    this.props.changeCharacter(this.props.characters.find(character => character._id === e.target.id))
  }
  editUser(e) {
    this.props.changeUser(e.target.id)
  }
  deleteUser(e) {
    const player = this.props.players.find(player => player._id === e.target.id)
    let c = window.confirm("Haluatko varmasti poistaa käyttäjän " + player.userName + "?")
    if (c) {
      fetch(REACT_APP_SERVER_URL + "user/delete/" + e.target.id)
        .then(response => response.json())
        .then(result => result.ok === 1 ? this.success() : this.props.error("Käyttäjän poisto ei onnistunut."))
        .catch(error => this.props.error(error, "danger"))
    }
  }
  success() {
    this.props.error("Poisto onnistui!", "success")
    this.props.fetchCharacters()
    this.props.fetchPlayers()
  }
  deleteCharacter(e) {
    const character = this.props.characters.find(character => character._id === e.target.id)
    let c = window.confirm("Haluatko varmasti poistaa hahmon " + character.name + "?")
    if (c) {
      fetch(REACT_APP_SERVER_URL + "character/delete/" + e.target.id)
        .then(response => response.json())
        .then(result => result.ok === 1 ? this.success() : this.props.error("Käyttäjän poisto ei onnistunut."))
        .catch(error => this.props.error(error, "danger"))
    }
  }
  componentDidMount() {
    this.props.fetchCharacters()
    this.props.fetchPlayers()
  }
  render() {
    const characterName = (characters, id) => { if (id) { try { return characters.find(character => character._id === id).name } catch { return "-" } } else { return "-" } }
    const playerName = (players, id) => { if (id) { try { return players.find(player => player._id === id).userName } catch { return "-" } } else { return "-" } }
    const characters = this.props.characters.map((character) => <tr key={character._id}>
      <td>{character.name}</td><td>{playerName(this.props.players, character.player)}</td>
      <td class="table-operations">
        <Link id={character._id} onClick={this.editCharacter} to="admin/newCharacter" class="btn btn-primary flex-fill m-2 w-100">Muokkaa</Link>
        <button id={character._id} onClick={this.deleteCharacter} class="btn btn-danger flex-fill m-2 w-100">Poista</button></td>
    </tr>);
    let players = null
    if (this.props.players)
      players = this.props.players.map((player) => player.userType === "player" ? <tr key={player._id}>
        <td>{player.userName}</td>
        <td>{characterName(this.props.characters, player.character)}</td>
        <td>{player.login}</td>
        <td class="table-operations"><Link id={player._id} onClick={this.editUser} to="admin/newUser" class="btn btn-primary flex-fill m-2 w-100">Muokkaa</Link>
          <button id={player._id} onClick={this.deleteUser} class="btn btn-danger flex-fill m-2 w-100">Poista</button></td>
      </tr> : null);
    if (this.props.admin === "admin")
      return (
        <main class="text-container container">
          <nav class="nav justify-content-center">
            <Link to="admin/transactions" class="nav-item">Maksutapahtumat</Link>
            <Link to="admin/messages" class="nav-item">Keskustelut</Link>
            <Link to="admin/newUser" class="nav-item">Uusi käyttäjä</Link>
            <Link to="admin/newCharacter" class="nav-item">Uusi hahmo</Link>
          </nav>
          <h2>Hahmot</h2>
          <table class="table table-dark w-100">
            <thead>
              <tr><th>Nimi</th><th>Pelaaja</th><th class="w-25">Operaatiot</th></tr>
            </thead>
            <tbody>{characters}</tbody>
          </table>

          <h2>Pelaajat</h2>
          <table class="table table-dark w-100">
            <thead>
              <tr><th>Oikea nimi</th><th>Hahmon nimi</th><th>Tunnus</th><th class="w-25">Operaatiot</th></tr>
            </thead>
            <tbody>{players}</tbody>
          </table>
        </main>
      )
    else
      return (
        <main class="text-container container"><p>Kirjaudu sisään nähdäksesi adminin työkalut.</p></main>
      )
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
      element: document.getElementById('editor-' + this.props.type),
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
      <div id={"editor-" + this.props.type} className="pell" />
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
      redirect: '',
      newId: '',
      error: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.checkInput = this.checkInput.bind(this)
    this.checkSuccess = this.checkSuccess.bind(this)
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
      let newPlayer = false
      let oldPlayer
      if (this.props.character.player !== this.state.player && this.state.player)
        newPlayer = true
      if (this.props.character.player && this.props.character.player !== this.state.player)
        oldPlayer = this.props.players.find(player => player._id === this.props.character.player)._id
      const data = JSON.stringify({
        name: this.state.name.replace(/["=';]/g, ""), // Clean input just to be sure
        age: this.state.age.replace(/[\D]/g, ""),
        gender: this.state.gender.replace(/["=';]/g, ""),
        player: this.state.player,
        saldo: parseFloat(this.state.saldo),
        description: this.state.description,
        mechanics: this.state.mechanics,
        plots: this.state.plots,
        newPlayer: newPlayer,
        oldPlayer: oldPlayer
      })
      let url = REACT_APP_SERVER_URL + "character/"
      if (this.props.character._id)
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
        .then(parsed => this.checkSuccess(parsed))
        .catch(error => this.props.error(error, "danger"))
    }
  }
  checkSuccess(result) {
    let fail = false
    result.forEach((part, counter) => {
      if (part !== null && part.ok !== 1) {
        this.props.error("Hahmon lisäys ei onnistunut.")
        fail = true
        return
      }
    })
    if (!fail)
      this.setState({ redirect: <Redirect to="/Totentanz/admin" /> })
  }
  checkInput() {
    const form = document.getElementById('characterForm')
    form.classList.add("was-validated")
    if (!form.checkValidity())
      this.props.error("Kentissä oli virheitä.", true)
    return form.checkValidity()
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
      <main class="text-container container">
        <form onSubmit={this.handleSubmit} noValidate id="characterForm">
          <div class="mb-3">
            <label class="form-label">Nimi:</label>
            <input class="form-control" maxLength="30" required pattern="[ .,\-'a-öA-Ö\d]*" type="text" value={this.state.name} onChange={this.handleChange} name="name"></input>
            <div class="invalid-feedback">
              Hahmolla täytyy olla nimi, ja ainoat sallitut erikoismerkit ovat .,-' ja numerot.
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">Ikä:</label> <input class="form-control" pattern="[\d]*" type="text" value={this.state.age} onChange={this.handleChange} name="age"></input>
            <div class="invalid-feedback">
              Iän täytyy olla numero.
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">Sukupuoli:</label> <input class="form-control" pattern="[a-öA-Ö]*" type="text" value={this.state.gender} onChange={this.handleChange} name="gender"></input>
            <div class="invalid-feedback">
              Sukupuoli ei voi sisältää numeroita tai erikoismerkkejä.
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">Pelaaja:</label> <select class="form-select" value={this.state.player} onChange={this.handleChange} name="player">
              <option value="" >-</option>{players}</select>
          </div>
          <div class="mb-3">
            <label class="form-label">Saldo:</label> <input class="form-control" pattern="^[\d]+(,\d\d)*" type="text" value={this.state.saldo} onChange={this.handleChange} name="saldo"></input>
            <div class="invalid-feedback">
              Saldon täytyy olla numero. Senttien erottimena käytetään pilkkua.
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">Kuvaus: </label>
            <Editor changeEditor={(data) => this.setState({ description: data })} html={this.state.description} type="description" />
          </div>
          <div class="mb-3">
            <label class="form-label">Juonet: </label>
            <Editor changeEditor={(data) => this.setState({ plots: data })} html={this.state.plots} type="plots" />
          </div>
          <div class="mb-3">
            <label class="form-label">Pelimekaniikat: </label>
            <Editor changeEditor={(data) => this.setState({ mechanics: data })} html={this.state.mechanics} type="mechanics" />
          </div>
          <button type="submit" onClick={this.handleSubmit} class="btn btn-primary">Tallenna</button>
          <Link to="/Totentanz/admin" class="btn btn-warning m-3">Poistu tallentamatta</Link>
        </form>
        {this.state.redirect}
      </main>
    );
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
    this.validateForm = this.validateForm.bind(this)
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
    if (this.validateForm()) {
      const data = {
        login: this.state.login.replace(/["=';]/g, ""),
        userName: this.state.playerName.replace(/["=';]/g, ""),
        character: this.state.selectedCharacter,
        userType: 'player'
      }
      let url = REACT_APP_SERVER_URL + "user/"
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
        .then(response => this.setState({ redirect: <Redirect to="/Totentanz/admin" /> }))
        .catch(error => this.props.error(error, "danger"))
    }
  }
  validateForm() {
    const form = document.getElementById('userForm')
    form.classList.add("was-validated")
    return form.checkValidity()
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
    const characters = this.props.characters.map((character) => <option value={character._id} key={character._id}>{character.name}</option>)
    return (
      <main class="text-container container">
        <form onSubmit={this.handleSubmit} noValidate id="userForm">
          <div class="mb-3">
            <label class="form-label">* Kirjautumistunnus</label>
            <input
              minLength="6"
              maxLength="20"
              required
              pattern="[a-öA-Ö\d]*"
              id="loginInput"
              class="form-control"
              type="text"
              name="login"
              value={this.state.login}
              onChange={this.handleChange}
              placeholder="Käyttäjän kirjautumiseen käyttämä tunnus"
            ></input>
            <div class="invalid-feedback" id="loginFeedback">
              Tarkista, että kirjautumistunnus on vähintään 6 merkkiä pitkä ja sisältää ainoastaan kirjaimia ja numeroita.
            </div>
          </div><div class="mb-3">
            <label class="form-label">* Pelaajan nimi</label>
            <input minLength="3" maxLength="30" required pattern="[ .,\-'a-öA-Ö\d]*" id="nameInput" class="form-control" type="text" name="playerName" value={this.state.playerName} onChange={this.handleChange}></input>
            <div class="invalid-feedback" id="nameFeedback">
              Nimi on pakollinen tieto ja se voi sisältää ainoastaan kirjaimia ja seuraavia merkkejä: ,.'-
            </div>
          </div><div class="mb-3">
            <label class="form-label">Hahmo</label><select class="form-select" name="selectedCharacter" value={this.state.selectedCharacter} onChange={this.handleChange}><option value="" key="none">-</option>{characters}</select>
          </div>
          <button type="submit" class="btn btn-primary">Tallenna</button>
          <Link to="/Totentanz/admin" class="btn btn-warning m-3">Poistu tallentamatta</Link>
        </form>
        {this.state.redirect}
      </main>
    )
  }
}

export default AdminDashboard