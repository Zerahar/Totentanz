import { Component } from "react";
import { Link } from "react-router-dom"
import { Trash } from 'react-bootstrap-icons'
const { REACT_APP_SERVER_URL } = process.env;
class ChatList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            chats: [],
            mode: '',
            isLoaded: false,
            error: '',
            selectedCharacters: [],
            selectedChat: '',
            warning: ''
        }
        this.handleChange = this.handleChange.bind(this)
        this.createChat = this.createChat.bind(this)
        this.fetchChats = this.fetchChats.bind(this)
    }
    componentDidMount() {
        this.fetchChats()
    }
    fetchChats() {
        let url = REACT_APP_SERVER_URL + '/chat/'
        if (this.props.loggedCharacter)
            url += this.props.loggedCharacter
        // If player has a character, fetch chats where they are participating. 
        // If admin, fetch all chats.
        if (this.props.loggedCharacter || this.props.type === "admin") {
            this.props.isReady(false)
            fetch(url)
                .then(res => res.json())
                .then(
                    (result) => {
                        // fill character names into chats
                        result.forEach(chat => {
                            let newParticipants = []
                            chat.participants.forEach(participant => newParticipants.push({ _id: participant, name: this.props.characters.find(a => a._id == participant).name }))
                            chat.participants = newParticipants
                        })
                        this.setState({ chats: result, isLoaded: true });
                        this.props.isReady(true)
                    }
                )
                .catch(error => this.props.error(error, "danger"))
        }
        else if (this.props.type === "guest")
            this.setState({ warning: 'Kirjaudu sisään nähdäksesi keskustelut.' })
        else
            this.setState({ warning: 'Sinulle ei ole asetettu omaa hahmoa. Ota yhteyttä pelinjohtoon.' })
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
        let characters = []
        if (loggedCharacter)
            characters = [loggedCharacter._id]
        this.state.selectedCharacters.map(character => characters.push(character._id))
        const data = JSON.stringify({ participants: characters })
        fetch(REACT_APP_SERVER_URL + "/chat/", {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: data
        })
            .then(response => response.json())
            .then(result => result.ok === 1 ? this.fetchChats() : this.props.error("Chatin luonti ei onnistunut."))
            .catch(error => this.props.error(error, "danger"))
        this.setState({ mode: '', selectedCharacters: [] })
    }
    removeChat(chat) {
        console.log(chat)
        let c = window.confirm("Haluatko poistaa keskustelun, jossa jäseninä ovat " + chat.participants.map(a => a.name) + "?")
        if (c) {
            fetch(REACT_APP_SERVER_URL + "/chat/delete/" + chat._id, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(result => result.ok === 1 ? this.fetchChats() : this.props.error("Chatin poisto ei onnistunut."))
                .catch(error => this.props.error(error, "danger"))
        }
    }
    render() {
        const characters = this.props.characters.filter(character => character._id !== this.props.loggedCharacter).map((character) =>
            <div class="row">
                <div class="col-auto">
                    <input type="checkbox" class="form-check-input" name={character._id} onChange={this.handleChange} />
                </div>
                <div class="col-auto">
                    <label class="form-check-label">{character.name}</label>
                </div>
            </div>)
        const chats = this.state.chats.map((chat) =>
            <li class="list-group-item chat-list-item d-flex justify-content-between"><Link id={chat._id} to="/Totentanz/chat"
                onClick={() => this.props.changeChat(chat)}
            >
                {/* Filter current user's name and then show all other participants in a chat */}
                {chat.participants
                    .filter(a => a._id != this.props.loggedCharacter)
                    .map((participant, index, array) => index === array.length - 1 ? participant.name : participant.name + ", ")}
            </Link>
                {this.props.type == "admin" ? <button class="btn btn-danger" onClick={() => this.removeChat(chat)}><Trash /></button> : ""}
            </li>);
        if (this.state.mode === "new") {
            return (<main class="text-container container">
                <h2>Valitse keskustelun jäsenet</h2>
                {characters}
                <br />
                <button onClick={this.createChat} class="btn btn-primary">Luo keskustelu</button>
            </main>)
        }
        else {
            return (
                <main class="text-container container">
                    <h2>Keskustelut</h2>
                    <p>{this.state.warning}</p>
                    <button onClick={() => this.setState({ mode: "new" })} class="btn btn-primary">Uusi keskustelu</button>
                    <br />
                    <ul class="list-group chat-list">{chats}</ul>
                </main>
            )
        }
    }
}

export default ChatList;