// Import React dependencies.
import React, { Component, useMemo, useState } from 'react'
// Import the Slate editor factory.
import { createEditor } from 'slate'
// Import the Slate components and React plugin.
import { Slate, Editable, withReact } from 'slate-react'

class CharacterMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      characters: [{ name: "Jack" }, { name: "Ripper" }, { name: "Hustler" }]
    }
  }
  render() {
    const characters = this.state.characters.map((character) => <tr><td>{character.name}</td><td><button>Muokkaa</button></td><td><button>Poista</button></td></tr>);
    return (

      <table>{characters}</table>
    );
  }
}

function Editor(props) {
  const editor = useMemo(() => withReact(createEditor()), [])
  // Add the initial value when setting up our state.
  const [value] = useState([
    {
      type: 'paragraph',
      children: [{ text: props.content }],
    },
  ])
  return (
    <Slate
      editor={editor}
      value={value}
      onChange={value => props.onChange(value)}
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

  handleChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }
  onDescriptionChange(e) {
    console.log(e)
    this.setState({
      description: ''
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
          <button type="submit">Tallenna</button>
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
      mode: null
    }
  }
  render() {
    let tab
    switch (this.state.mode) {
      case "new": tab = <NewCharacter />; break;
      case "messages": tab = <Messages />; break;
      default: tab = <CharacterMenu />
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