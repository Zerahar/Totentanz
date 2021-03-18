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
            console.log("Sending username: ", this.props.user.name)
            this.ws.send(JSON.stringify({ text: this.props.user.name, type: 'name', chat: this.props.chat._id }))
            this.setState({ nameSent: true, ready: true })
        }
        this.ws.onmessage = evt => {
            // listen to data sent from the websocket server
            const message = JSON.parse(evt.data)
            console.log(message)
            if (message.type === 'message') {
                const newMessage = {
                    time: new Date(message.data.time).toString(),
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
                        time: new Date(msg.time).toString(),
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
            history = this.state.history.map(message => <p>({message.time}) {message.user}: {message.text}</p>)
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