// Import React dependencies.
import React, { Component, useMemo, useState, useEffect } from 'react'
// Import the Slate editor factory.
import { createEditor } from 'slate'
// Import the Slate components and React plugin.
import { Slate, Editable, withReact } from 'slate-react'

class CharacterMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      characters: [],
      isLoaded: false,
      error: null
    }
    this.editCharacter = this.editCharacter.bind(this);
  }
  editCharacter(e) {
    this.props.changeCharacter(e.target.id)
  }
  componentDidMount() {
    fetch('http://localhost:3002/character/')
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            characters: result
          });
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
  }
  render() {
    const characters = this.state.characters.map((character) => <tr><td>{character.name}</td><td>{character.player}</td><td><button id={character._id} onClick={this.editCharacter}>Muokkaa</button><button>Poista</button></td></tr>);
    return (

      <table>
        <thead>
          <tr><th>Nimi</th><th>Pelaaja</th><th>Operaatiot</th></tr>
        </thead>
        <tbody>
          {characters}
        </tbody>
      </table>
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
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label>Nimi:</label> <input type="text" value={this.state.name} onChange={this.handleChange} name="name"></input><br />
          <label>Ikä:</label> <input type="text" value={this.state.age} onChange={this.handleChange} name="age"></input><br />
          <label>Sukupuoli:</label> <input type="text" value={this.state.gender} onChange={this.handleChange} name="gender"></input><br />
          <label>Pelaaja:</label> <input type="text" value={this.state.player} onChange={this.handleChange} name="player"></input><br />
          <label>Saldo:</label> <input type="text" value={this.state.saldo} onChange={this.handleChange} name="saldo"></input><br />
          <label>Kuvaus: </label>
          <Editor content={this.state.description} onChange={this.onDescriptionChange} />
          <label>Juonet: </label>
          <Editor content={this.state.plots} onChange={this.onPlotsChange} />
          <label>Pelimekaniikat: </label>
          <Editor content={this.state.mechanics} onChange={this.onMechanicsChange} />
          <button type="submit" onClick={this.handleSubmit}>Tallenna</button>
          <button type="reset">Poistu tallentamatta</button>
        </form>
      </div>
    );
  }
}

function Messages() {
  return (
    <p>Täällä viestejä.</p>
  )
}

class AdminDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: null,
      selectedCharacter: null
    }
    this.changeCharacter = this.changeCharacter.bind(this);
  }
  changeCharacter(id) {
    this.setState({ selectedCharacter: id })
    this.setState({ mode: "new" })
  }
  render() {
    let tab
    switch (this.state.mode) {
      case "new": tab = <NewCharacter selectedCharacter={this.state.selectedCharacter} />; break;
      case "messages": tab = <Messages />; break;
      default: tab = <CharacterMenu selectedCharacter={this.state.selectedCharacter} changeCharacter={this.changeCharacter} />
    }
    return (
      <div>
        <h2>Dashboard</h2>
        <button onClick={() => { this.setState({ mode: "messages" }) }}>Keskustelut</button><button onClick={() => { this.setState({ mode: "new" }) }}>Uusi hahmo</button>
        {tab}
      </div>
    );
  }
}

export default AdminDashboard