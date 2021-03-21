import { Component } from "react";
import { Link } from "react-router-dom"
import OpenChat from './OpenChat.js'
export class PlayerInfo extends Component {
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
                <Link to="/dashboard">Takaisin</Link>
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

export class Pay extends Component {
    constructor(props) {
        super(props);
        this.state = {
            amount: 0,
            warning: '',
            selectedCharacter: ''
        }
        this.submit = this.submit.bind(this)
        this.handleChange = this.handleChange.bind(this)
    }
    submit(e) {
        e.preventDefault()
        if (this.state.amount < 0)
            this.setState({ warning: "Virheellinen summa" })
        else if (this.state.amount > this.props.character.saldo)
            this.setState({ warning: "Tililläsi ei ole tarpeeksi saldoa" })
        else if (!this.state.selectedCharacter)
            this.setState({ warning: "Valitse maksun saaja" })
        else {
            let c = window.confirm("Haluatko maksaa " + this.state.amount + " eurodollaria kohteelle " +
                this.props.characters.find(character => character._id === this.state.selectedCharacter).name + "?")
            if (c) {
                const transaction = JSON.stringify({
                    time: Date.now(),
                    user: this.props.character._id,
                    recipient: this.state.selectedCharacter,
                    amount: this.state.amount
                })
                fetch('http://localhost:3002/pay/', {
                    method: 'POST',
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: transaction
                })
                    .then(
                        fetch('http://localhost:3002/character/saldo/' + this.state.selectedCharacter, {
                            method: 'POST',
                            mode: 'cors',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ saldo: this.state.amount })
                        })
                            .then(
                                fetch('http://localhost:3002/character/saldo/' + this.props.character._id, {
                                    method: 'POST',
                                    mode: 'cors',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({ saldo: -this.state.amount })
                                })
                                    .then(response => response.ok ? this.props.return() : this.setState({ warning: response.statusText }))
                            )
                    )
            }
        }
    }
    handleChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        this.setState({
            [name]: value
        });
    }
    render() {
        const options = this.props.characters.map((character) => { if (character._id !== this.props.character._id) return <option value={character._id}>{character.name}</option> });
        return (
            <div>
                <Link to="/dashboard">Takaisin</Link>
                <h2>Pay</h2>
                <p>Sinulla on {this.props.character.saldo} eurodollaria.</p>
                <form onSubmit={this.submit}>
                    <label>Vastaanottaja</label><br />
                    <select name="selectedCharacter" value={this.state.selectedCharacter} onChange={this.handleChange}>
                        <option>-</option>{options}</select><br />
                    <label>Summa</label><br />
                    <input name="amount" required value={this.state.amount} onChange={this.handleChange}></input>
                    <span>{this.state.warning}</span>
                    <button type="submit">Maksa</button>
                </form>
            </div>
        )
    }
}

export class Message extends Component {
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
                <Link to="/dashboard">Takaisin</Link>
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
                    <Link to="/dashboard">Takaisin</Link>
                    <h2>Message</h2>
                    <button onClick={() => this.setState({ mode: "new" })}>Uusi keskustelu</button>
                    <ul>{chats}</ul>
                </div>
            )
        }
    }
}

// class Tabs extends Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             mode: null
//         }
//         this.return = this.return.bind(this)
//     }
//     return() {
//         this.setState({ mode: null })
//         this.props.fetchCharacters()
//     }
//     render() {
//         let backbutton, otherButtons
//         if (this.state.mode != null)
//             backbutton = <a href="dashboard/">Takaisin</a>
//         else
//             otherButtons = <div><a href="dashboard/pay">Maksa</a>
//                 <a href="dashboard/info">Info</a>
//                 <a href="dashboard/chat">Viestit</a></div>;
//         // let redirect
//         // switch (this.state.mode) {
//         //     case "pay": redirect = <Pay characters={this.props.characters} character={this.props.characters.find(character => character._id === this.props.loggedCharacter)} return={this.return} />; break;
//         //     case "info": redirect = <Info character={this.props.characters.find(character => character._id === this.props.loggedCharacter)} />; break;
//         //     case "message": redirect = <Message characters={this.props.characters} loggedCharacter={this.props.loggedCharacter} />; break;
//         //     default: redirect = null
//         // }
//         return (
//             <div>
//                 <h2>Dashboard</h2>
//                 <div>
//                     {otherButtons}
//                     {backbutton}
//                     {/* {redirect} */}
//                     <Switch>
//                         <Route path="/dashboard/pay">
//                             <Pay characters={this.props.characters} character={this.props.characters.find(character => character._id === this.props.loggedCharacter)} return={this.return} />; break;
//                         </Route>
//                         <Route path="/dashboard/info">
//                             <Info character={this.props.characters.find(character => character._id === this.props.loggedCharacter)} />
//                         </Route>
//                         <Route path="/dashboard/chat">
//                             <Message characters={this.props.characters} loggedCharacter={this.props.loggedCharacter} />
//                         </Route>
//                     </Switch>
//                 </div>
//             </div>
//         );
//     }
// }

export class PlayerDashboard extends Component {
    componentDidMount() {
        this.props.fetchCharacters()
    }
    render() {
        let access = <p>Kirjaudu sisään nähdäksesi hahmotietosi</p>
        if (this.props.loggedCharacter)
            access = <div><Link to="dashboard/pay">Maksa</Link>
                <Link to="dashboard/info">Info</Link>
                <Link to="dashboard/chat">Viestit</Link></div>
        return (
            <div>
                <h2>Player Dashboard</h2>
                {access}
            </div>
        )
    }
}

export default PlayerInfo;
