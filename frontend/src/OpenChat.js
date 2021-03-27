
const { Component } = require("react");

class OpenChat extends Component {
    constructor(props) {
        super(props);
        this.state = {
            input: '',
            nameSent: false,
            history: [],
            ready: false
        }
        this.sendMessage = this.sendMessage.bind(this)
        this.messageBeingWritten = this.messageBeingWritten.bind(this)
        this.opened = this.opened.bind(this)
        this.addMessage = this.addMessage.bind(this)
        window.WebSocket = window.WebSocket || window.MozWebSocket;
        if (!window.WebSocket) {
            this.error("Selain ei tue chat-teknologiaa")
        }
        this.ws = new WebSocket('ws://127.0.0.1:1337');
    }
    componentWillUnmount() {
        this.ws.close()
    }
    componentDidMount() {
        this.ws.onopen = () => {
            // on connecting, do nothing but log it to the console
            console.log('connected')
            let name
            if (this.props.user === "admin")
                name = "admin"
            else
                name = this.props.user.name
            console.log("Sending username: ", name)
            this.ws.send(JSON.stringify({ text: name, type: 'name', chat: this.props.chat._id }))
            this.setState({ nameSent: true, ready: true })
        }
        this.ws.onmessage = evt => {
            // listen to data sent from the websocket server
            const message = JSON.parse(evt.data)
            console.log(message)
            if (message.type === 'message') {
                const newMessage = {
                    time: new Date(message.data.time).toLocaleString("fi-FI", { timeStyle: "short", dateStyle: "medium" }),
                    text: message.data.text,
                    user: message.data.author
                }
                this.setState(prevState => ({
                    history: [...prevState.history, newMessage]
                }))
            }
            if (message.type === 'history') {
                message.data.map(msg => this.setState(prevState => ({
                    history: [...prevState.history, {
                        time: new Date(msg.time).toLocaleString("fi-FI", { timeStyle: "short", dateStyle: "medium" }),
                        text: msg.text,
                        user: msg.author
                    }]
                })))
            }
        }
        this.ws.onclose = () => {
            console.log('disconnected')
        }


    }
    opened() {

    }
    error(error) {
        console.log(error)
    }
    addMessage(message) {
        if (message)
            this.setState(prevState => ({
                history: [...prevState.history, message]
            }))
    }
    sendMessage() {
        if (this.state.ready) {
            console.log("Sent ", this.state.input)
            this.ws.send(JSON.stringify({ text: this.state.input, chat: this.props.chat._id, type: 'message' }))
            this.setState({
                input: ''
            })
        }
        else
            console.log("WS was not ready")
    }
    messageBeingWritten(event) {
        this.setState({ input: event.target.value })
    }
    render() {
        let history = ''
        if (this.state.history.length !== 0)
            history = this.state.history.map(message =>
                <div class={(message.user === this.props.user || message.user === this.props.user.name) ? "toast show my-message w-75" : "toast show mb-3 w-75"}>
                    {/* Show user's own messages on right */}
                    <div class="toast-header">
                        <strong class="me-auto">{message.user}</strong>
                        <small>{message.time}</small>
                    </div>
                    <div class="toast-body">
                        {message.text}
                    </div>
                </div>
            )
        // let backbutton = <Link to="/dashboard">Takaisin</Link>
        // if (this.props.user === "admin")
        //     backbutton = <Link to="/admin">Takaisin</Link>
        return (
            <div class="chat-container d-flex flex-column">
                <h2>{this.props.chat.participants.map((participant, index, array) => index === array.length - 1 ? participant.name : participant.name + ", ")}</h2>
                <div class="overflow-auto messages-container p-3 flex-grow-1">{history}</div>
                <div class="input-group">
                    <input class="form-control" type="text" value={this.state.input} onChange={this.messageBeingWritten}></input>
                    <button class="btn btn-primary" onClick={this.sendMessage}>Lähetä</button>
                </div>
            </div>
        )
    }
}
export default OpenChat