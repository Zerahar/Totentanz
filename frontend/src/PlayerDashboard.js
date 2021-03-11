import { Component } from "react";
function Info() {
    return (
        <div>
            <h2>Info</h2>
            <p>Hahmotiedot</p>
        </div>
    );
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
            case "info": tab = <Info />; break;
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