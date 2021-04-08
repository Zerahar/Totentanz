import { Component } from "react";
import { Link } from "react-router-dom"

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
            <div class="text-container">
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
            selectedCharacter: '',
            success: ''
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
                                    .then(response => response.ok ? this.success() : this.setState({ warning: response.statusText }))
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
    success() {
        this.props.fetchCharacters()
        this.setState({
            amount: 0,
            selectedCharacter: '',
            warning: '',
            success: <span>Maksu onnistui!</span>
        })
    }
    render() {
        const options = this.props.characters.map((character) => { if (character._id !== this.props.character._id) return <option value={character._id}>{character.name}</option>; else return null });
        return (
            <div class="text-container">
                <Link to="/dashboard">Takaisin</Link>
                <h2>Pay</h2>
                {this.state.success}
                <p>Sinulla on {this.props.character.saldo} eurodollaria.</p>
                <form onSubmit={this.submit}>
                    <div class="mb-3">
                        <label class="form-label">Vastaanottaja</label>
                        <select class="form-select" name="selectedCharacter" value={this.state.selectedCharacter} onChange={this.handleChange}>
                            <option value="">-</option>{options}</select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Summa</label>
                        <input class="form-control" name="amount" required value={this.state.amount} onChange={this.handleChange}></input>
                    </div>
                    <span>{this.state.warning}</span>
                    <button type="submit" class="btn btn-primary">Maksa</button>
                </form>
            </div>
        )
    }
}


export class PlayerDashboard extends Component {
    componentDidMount() {
        this.props.fetchCharacters()
    }
    render() {
        let access = <p>Kirjaudu sisään nähdäksesi hahmotietosi</p>
        if (this.props.loggedCharacter)
            access = <div class="d-flex player-controls">
                <div class="flex-fill d-flex p-3">
                    <Link to="dashboard/pay" class="btn btn-primary flex-fill fs-5">Maksa</Link>
                </div>
                <div class="flex-fill d-flex p-3">
                    <Link to="dashboard/info" class="btn btn-primary flex-fill fs-5">Info</Link>
                </div>
                <div class="flex-fill d-flex p-3">
                    <Link to="dashboard/chat" class="btn btn-primary flex-fill fs-5">Viestit</Link>
                </div></div>
        return (
            <div class="text-container">
                <h2>Omat tiedot</h2>
                {access}
            </div>
        )
    }
}

export default PlayerInfo;
