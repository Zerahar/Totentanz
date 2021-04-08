
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
            currentName: this.props.name
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
                    history: [...prevState.history, newMessage]
                }), () => { document.getElementById("message-container").scrollTop = document.getElementById("message-container").scrollHeight; return null })
            }
            if (message.type === 'history') {
                message.data.map(msg => this.setState(prevState => ({
                    history: [...prevState.history, {
                        time: new Date(msg.time).toLocaleString("fi-FI", { timeStyle: "short", dateStyle: "medium" }),
                        text: msg.text,
                        author: msg.author,
                        authorId: msg.authorId
                    }]
                })))
            }
        }

    }
    addMessage(message) {
        if (message)
            this.setState(prevState => ({
                history: [...prevState.history, message]
            }))
    }
    sendMessage() {

        console.log("Sent ", this.state.input)
        this.ws.send(JSON.stringify({ text: this.state.input, chat: this.props.chat._id, characterId: this.props.characterId, name: this.state.currentName, type: 'message' }))
        this.setState({
            input: ''
        })

    }
    messageBeingWritten(event) {
        this.setState({ input: event.target.value })
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

        return (
            <div class="chat-container d-flex flex-column text-container container">
                <h2>{this.props.chat.participants.map((participant, index, array) => index === array.length - 1 ? participant.name : participant.name + ", ")}</h2>
                <div class="overflow-auto messages-container p-3 flex-grow-1" id="message-container">{history}</div>
                <div class="input-group">
                    <input class="form-control" type="text" value={this.state.input} onChange={this.messageBeingWritten}></input>
                    <button class="btn btn-primary" onClick={this.sendMessage}>Lähetä</button>
                </div>
            </div>
        )
    }
}
export default OpenChat