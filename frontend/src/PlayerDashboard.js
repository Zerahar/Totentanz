import { Component } from "react";
function Info() {
    return (
        <div>
            <h2>Info</h2>
        </div>
    );
}

function Pay() {
    return (
        <div>
            <h2>Pay</h2>
        </div>
    );
}

function Message() {
    return (
        <div>
            <h2>Message</h2>
        </div>
    );
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