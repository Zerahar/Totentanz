
import { Redirect } from "react-router-dom";
const { Component } = require("react");
class OpenChat extends Component {
    constructor(props) {
        super(props);
        this.state = {
            input: '',
            nameSent: false,
            history: [],
            ready: false,
            chat: '',
            currentName: this.props.name,
            redirect: '',
            noMessages: false
        }
        this.sendMessage = this.sendMessage.bind(this)
        this.messageBeingWritten = this.messageBeingWritten.bind(this)
        this.addMessage = this.addMessage.bind(this)
        window.WebSocket = window.WebSocket || window.MozWebSocket;
        if (!window.WebSocket) {
            this.props.error(new Error("Selain ei tue chat-teknologiaa"))
        }
        this.ws = this.props.ws
    }
    componentDidMount() {
        // Go back if the page was refreshed
        if (!this.props.chat)
            this.setState({ redirect: <Redirect to="/" /> })
        else {
            this.props.isReady(false)
            // Fill character name if undefined
            if (!this.state.currentName)
                this.setState({ currentName: this.props.characters.find(character => character._id === this.props.characterId).name })
            // Tell server that chat is open
            this.ws.send(JSON.stringify({ chat: this.props.chat._id, type: 'openChat' }))

            this.ws.onmessage = evt => {
                // listen to data sent from the websocket server
                const message = JSON.parse(evt.data)
                if (message.type === 'message') {
                    const newMessage = {
                        time: new Date(message.data.time).toLocaleString("fi-FI", { timeStyle: "short", dateStyle: "medium" }),
                        text: message.data.text,
                        author: message.data.author,
                        authorId: message.data.authorId
                    }
                    this.setState(prevState => ({
                        history: [...prevState.history, newMessage],
                        noMessages: false
                    }), () => { document.getElementById("message-container").scrollTop = document.getElementById("message-container").scrollHeight; return null })
                }
                if (message.type === 'history') {
                    if (message.data.length === 0) {
                        this.setState({ noMessages: true })
                    }
                    else {
                        message.data.map(msg => this.setState(prevState => ({
                            history: [...prevState.history, {
                                time: new Date(msg.time).toLocaleString("fi-FI", { timeStyle: "short", dateStyle: "medium" }),
                                text: msg.text,
                                author: msg.author,
                                authorId: msg.authorId
                            }]
                        })))
                        document.getElementById("message-container").scrollTop = document.getElementById("message-container").scrollHeight;
                    }
                    this.props.isReady(true)
                }
            }
        }
    }
    addMessage(message) {
        if (message)
            this.setState(prevState => ({
                history: [...prevState.history, message]
            }))
    }
    sendMessage(e) {
        e.preventDefault()
        console.log("Sent ", this.state.input)
        this.ws.send(JSON.stringify({ text: this.state.input, chat: this.props.chat._id, characterId: this.props.characterId, name: this.state.currentName, type: 'message' }))
        this.setState({
            input: ''
        })
    }
    messageBeingWritten(event) {
        this.setState({ input: event.target.value })
    }
    componentWillUnmount() {
        this.props.clear()
    }
    render() {
        let history = ''
        if (this.state.history.length !== 0)
            history = this.state.history.map(message =>
                <div key={message._id} class={(message.author === this.state.currentName) ? "toast show my-message w-75" : "toast show mb-3 w-75"}>
                    {/* Show user's own messages on right */}
                    <div class="toast-header">
                        <strong class="me-auto">{message.author}</strong>
                        <small>{message.time}</small>
                    </div>
                    <div class="toast-body">
                        {message.text}
                    </div>
                </div>
            )
        let header = ''
        if (this.props.chat && this.props.chat.participants)
            header = this.props.chat.participants.map((participant, index, array) => index === array.length - 1 ? participant.name : participant.name + ", ")
        let noMessagesTip = ""
        if (this.state.noMessages)
            noMessagesTip = <p class="text-center">Tässä keskustelussa ei ole vielä viestejä. Lähetä yksi!</p>
        return (
            <div class="chat-container d-flex flex-column text-container container">
                {this.state.redirect}
                <h2>{header}</h2>
                <div class="overflow-auto messages-container p-3 flex-grow-1" id="message-container">
                    {noMessagesTip}
                    {history}
                </div>

                <form onSubmit={this.sendMessage}><div class="input-group">
                    <input class="form-control" type="text" value={this.state.input} onChange={this.messageBeingWritten} id="message-input"></input>

                    <button class="btn btn-primary" type="submit">Lähetä</button>
                </div></form>

            </div>
        )
    }
}
export default OpenChat