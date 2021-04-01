import OpenChat from './OpenChat.js'
import { Component } from "react";
import { Link } from "react-router-dom"

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
        let url = 'http://localhost:3002/chat/'
        if (this.props.loggedCharacter)
            url += this.props.loggedCharacter
        // If player has a character, fetch chats where they are participating. 
        // If admin, fetch all chats.
        if (this.props.loggedCharacter || this.props.type === "admin")
            fetch(url)
                .then(res => res.json())
                .then(
                    (result) => {
                        this.setState({ chats: result, isLoaded: true });
                    }
                )
                .catch(error => this.props.error(error))
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
        let characters = [{ _id: loggedCharacter._id, name: loggedCharacter.name, player: loggedCharacter.player }]
        this.state.selectedCharacters.map(character => characters.push({ _id: character._id, name: character.name, player: character.player }))
        const data = { participants: characters }
        let xhttp = new XMLHttpRequest();
        xhttp.open("POST", "http://localhost:3002/chat/", true);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.onreadystatechange = (e) => this.fetchChats(e)
        xhttp.send(JSON.stringify(data));
        this.setState({ mode: '', selectedCharacters: [] })
    }
    render() {
        const characters = this.props.characters.filter(character => character._id !== this.props.loggedCharacter).map((character) =>
            <div class="row">
                <div class="col-auto">
                    <input type="checkbox" class="form-check" name={character._id} onChange={this.handleChange} />
                </div>
                <div class="col-auto">
                    <label class="form-label">{character.name}</label>
                </div>
            </div>)
        const chats = this.state.chats.map((chat) =>
            <Link id={chat._id}
                class="list-group-item chat-list-item" to="/chat"
                onClick={() => this.props.changeChat(chat)}
            >
                {chat.participants.map((participant, index, array) => index === array.length - 1 ? participant.name : participant.name + ", ")}
            </Link>);
        if (this.state.mode === "new") {
            return (<div>
                <label>Valitse keskustelun jäsenet</label>
                {characters}
                <button onClick={this.createChat} class="btn btn-primary">Luo keskustelu</button>
            </div>)
        }
        else {
            return (
                <div class="text-container">
                    <h2>Keskustelut</h2>
                    <p>{this.state.warning}</p>
                    <button onClick={() => this.setState({ mode: "new" })} class="btn btn-primary">Uusi keskustelu</button>
                    <ul class="list-group">{chats}</ul>
                </div>
            )
        }
    }
}

export default ChatList;