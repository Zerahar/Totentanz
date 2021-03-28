import { Component } from "react";

class Transactions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            history: []
        }
    }
    componentDidMount() {
        if (this.props.characters.length === 0)
            this.props.fetchCharacters()
        fetch('http://localhost:3002/transaction/')
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        history: result
                    });
                })
    }
    render() {
        const history = this.state.history.map(event => {
            let user = this.props.characters.find(character => character._id === event.user)
            let recipient = this.props.characters.find(character => character._id === event.recipient)
            // If characters match, use their names
            user ? user = user.name : user = ""
            recipient ? recipient = recipient.name : recipient = ""
            return <tr id={event._id}>
                <td>{user}</td>
                <td>{recipient}</td>
                <td>{event.amount}</td>
                <td>{new Date(event.time).toLocaleString("fi-FI")}</td>
            </tr>
        })
        return (
            <div>
                <h2>Maksutapahtumat</h2>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Maksaja</th>
                            <th>Kohde</th>
                            <th>Summa</th>
                            <th>Aika</th>
                        </tr></thead><tbody>
                        {history}
                    </tbody></table>
            </div>
        )
    }
}
export default Transactions