import { Component } from "react";
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
        this.fillFields = this.fillFields.bind(this)
    }
    componentDidMount() {
        fetch('http://localhost:3002/character/' + this.props.loggedCharacter)
            .then(response => response.json())
            .then(blob => this.fillFields(blob))
    }
    fillFields(data) {
        this.setState({ name: data.name })
        this.setState({ age: data.age })
        this.setState({ gender: data.gender })
        this.setState({ saldo: data.saldo })
        this.setState({ description: data.description[0].children[0].text })
        this.setState({ plots: data.plots[0].children[0].text })
        this.setState({ mechanics: data.mechanics[0].children[0].text })
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
                <p>{this.state.description}</p>
                <h3>Juonet</h3>
                <p>{this.state.plots}</p>
                <h3>Pelimekaniikat</h3>
                <p>{this.state.mechanics}</p>
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
            chats: [{ participants: ["Mary", "Ellie", "Rick"] }, { participants: ["Connor", "Ellie", "Rick"] }]
        }
    }
    render() {
        const chats = this.state.chats.map((chat) => <li>{chat.participants.map((participant) => participant + ", ")}</li>);
        return (
            <div>
                <h2>Message</h2>
                <button>Uusi keskustelu</button>
                <ul>{chats}</ul>
            </div>
        )
    }
}

class Tabs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mode: null,
            loggedCharacter: "604b9d91babd4a59a81861d3"
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
            case "info": tab = <Info loggedCharacter={this.state.loggedCharacter} />; break;
            case "message": tab = <Message />; break;
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

function PlayerDashboard() {
    return (
        <div>
            <h2>Player Dashboard</h2>
            <Tabs />
        </div>
    )

}

export default PlayerDashboard