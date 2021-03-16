const { Component } = require("react");

class OpenChat extends Component {
    constructor(props) {
        super(props);
        this.state = {
            input: '',
            nameSent: false,
            history: []
        }
        this.sendMessage = this.sendMessage.bind(this)
        this.messageBeingWritten = this.messageBeingWritten.bind(this)
        this.opened = this.opened.bind(this)


    }
    componentDidMount() {
        window.WebSocket = window.WebSocket || window.MozWebSocket;
        if (!window.WebSocket) {
            this.error("Selain ei tue chat-teknologiaa")
        }
        this.connection = new WebSocket('ws://127.0.0.1:1337');
        this.connection.onopen = this.opened()
        this.connection.onerror = this.error()
        this.connection.onmessage = this.onMessage()
    }
    opened() {

    }
    error(error) {
        console.log(error)
    }
    onMessage(message) {
        try {
            var json = JSON.parse(message.data);
            console.log(json)
        } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ',
                message);
            return;
        }
    }
    sendMessage() {
        if (!this.state.nameSent) {
            console.log("Sending username: ", this.props.user.name)
            this.connection.send(this.props.user.name)
        }
        console.log("Sent ", this.state.input)
        this.connection.send(this.state.input)
        this.setState(prevState => ({
            history: [...prevState.history, { time: new Date().toLocaleTimeString(), text: this.state.input, user: this.props.user.name }],
            input: ''
        }))
    }
    messageBeingWritten(event) {
        this.setState({ input: event.target.value })
    }
    render() {
        let history = this.state.history.map(message => <p>({message.time}) {message.user}: {message.text}</p>)
        return (
            <div>
                <h2>{this.props.chat.participants.map((participant) => participant.name + ", ")}</h2>
                <div>{history}</div>
                <input type="text" value={this.state.input} onChange={this.messageBeingWritten}></input><button onClick={this.sendMessage}>Lähetä</button>
            </div>
        )
    }
}
export default OpenChat