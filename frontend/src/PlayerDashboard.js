import { Component } from "react";
import OpenChat from './OpenChat.js'
class Info extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            age: '',
            gender: '',
            saldo: '',
            description: 'Hahmon kuvaus',
            mechanics: 'Pelimekaniikat',
            plots: 'Juonet'
        }
    }
    componentDidMount() {
        if (this.props.character) {
            this.setState({ name: this.props.character.name })
            this.setState({ age: this.props.character.age })
            this.setState({ gender: this.props.character.gender })
            this.setState({ saldo: this.props.character.saldo })
            this.setState({ description: this.props.character.description })
            this.setState({ plots: this.props.character.plots })
            this.setState({ mechanics: this.props.character.mechanics })
        }
    }
    render() {
        return (
            <div>
                <h2>Info</h2>
                <ul>
                    <li>Nimi: {this.state.name}</li>
                    <li>Ikä: {this.state.age}</li>
                    <li>Sukupuoli: {this.state.gender}</li>
                    <li>Saldo: {this.state.saldo}</li>
                </ul>
                <h3>Kuvaus</h3>
                <div dangerouslySetInnerHTML={{ __html: this.state.description }} />
                <h3>Juonet</h3>
                <div dangerouslySetInnerHTML={{ __html: this.state.plots }} />
                <h3>Pelimekaniikat</h3>
                <div dangerouslySetInnerHTML={{ __html: this.state.mechanics }} />
            </div>
        );
    }
}

class Pay extends Component {
    constructor(props) {
        super(props);
        this.state = {
            characters: []
        }
    }
    componentDidMount() {
        this.setState({
            characters: [{ name: "John" }, { name: "Ellis" }]
        })
    }
    render() {
        const options = this.state.characters.map((character) => <option>{character.name}</option>);
        const saldo = 345
        return (
            <div>
                <h2>Pay</h2>
                <p>Sinulla on {saldo} eurodollaria.</p>
                <form>
                    <label>Vastaanottaja</label><br />
                    <select>{options}</select><br />
                    <label>Summa</label><br />
                    <input type="number"></input>
                    <button>Maksa</button>
                </form>
            </div>
        )
    }
}

class Message extends Component {
    constructor(props) {
        super(props);
        this.state = {
            chats: [],
            mode: '',
            isLoaded: false,
            error: '',
            selectedCharacters: [],
            selectedChat: ''
        }
        this.handleChange = this.handleChange.bind(this)
        this.createChat = this.createChat.bind(this)
    }
    componentDidMount() {
        console.log("Fetching chats")
        fetch('http://localhost:3002/chat/' + this.props.loggedCharacter)
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({ chats: result, isLoaded: true });
                }
            )
    }
    handleChange(event) {
        if (event.target.checked)
            this.setState(prevState => ({ selectedCharacters: [...prevState.selectedCharacters, this.props.characters.find(character => character._id === event.target.name)] }))
        else {
            let filteredArray = this.state.selectedCharacters.filter(character => character._id !== event.target.name)
            this.setState({ selectedCharacters: filteredArray })
        }
    }
    createChat() {
        const loggedCharacter = this.props.characters.find(character => character._id === this.props.loggedCharacter)
        let characters = [{ _id: loggedCharacter._id, name: loggedCharacter.name, player: loggedCharacter.player }]
        this.state.selectedCharacters.map(character => characters.push({ _id: character._id, name: character.name, player: character.player }))
        const data = { participants: characters }
        let xhttp = new XMLHttpRequest();
        xhttp.open("POST", "http://localhost:3002/chat/", true);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(JSON.stringify(data));
        this.setState({ mode: '', selectedCharacters: [] })
    }
    render() {
        const characters = this.props.characters.filter(character => character._id !== this.props.loggedCharacter).map((character) => <li><input type="checkbox" name={character._id} onChange={this.handleChange} />{character.name}</li>)
        const chats = this.state.chats.map((chat) => <li>
            {chat.participants.map((participant) => participant.name + ", ")}
            <button onClick={() => this.setState({ mode: "open", selectedChat: chat })}>Avaa</button>
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
                <OpenChat chat={this.state.selectedChat} user={this.props.characters.find(character => character._id === this.props.loggedCharacter)} />
            )
        }
        else {
            return (
                <div>
                    <h2>Message</h2>
                    <button onClick={() => this.setState({ mode: "new" })}>Uusi keskustelu</button>
                    <ul>{chats}</ul>
                </div>
            )
        }
    }
}

class Tabs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mode: null
        }
    }
    render() {
        let backbutton, otherButtons
        if (this.state.mode != null)
            backbutton = <button onClick={() => { this.setState({ mode: null }) }}>Back</button>
        else
            otherButtons = <div><button onClick={() => { this.setState({ mode: "pay" }) }}>Maksa</button>
                <button onClick={() => { this.setState({ mode: "info" }) }}>Tiedot</button>
                <button onClick={() => { this.setState({ mode: "message" }) }}>Viestit</button></div>;
        let tab
        switch (this.state.mode) {
            case "pay": tab = <Pay />; break;
            case "info": tab = <Info character={this.props.characters.find(character => character._id === this.props.loggedCharacter)} />; break;
            case "message": tab = <Message characters={this.props.characters} loggedCharacter={this.props.loggedCharacter} />; break;
            default: tab = null
        }
        return (
            <div>
                <h2>Dashboard</h2>
                <div>
                    {otherButtons}
                    {backbutton}
                    {tab}
                </div>
            </div>
        );
    }
}

class PlayerDashboard extends Component {
    componentDidMount() {
        this.props.fetchCharacters()
    }
    render() {
        return (
            <div>
                <h2>Player Dashboard</h2>
                <Tabs loggedCharacter={this.props.loggedCharacter} characters={this.props.characters} />
            </div>
        )
    }
}

export default PlayerDashboard