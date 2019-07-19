import React, {Component} from 'react';

class ReservationsList extends Component {
  state = {
    reservations: []
  };

  componentDidMount() {
    fetch('/reservations')
      .then(res => res.json())
      .then(reservations => this.setState({reservations}));
  }

  render() {
    //figure out why reservation doesn't have a unique key
    return (
      <div className="App">
        <h1>Reservations</h1>
        {this.state.reservations.map(reservation => (
          <div key={Math.random()}>
            {reservation.name}, {reservation.time}
          </div>
        ))}
      </div>
    );
  }
}

export default ReservationsList;
