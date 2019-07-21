const moment = require('moment');
const {db, Reservations} = require('./models/index');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const createReservation = async (message, twilioData) => {
  const [name, date, reservationTime] = message;
  const reservationDate = moment(date, 'MM-DD-YYYY')
    .utc()
    .valueOf();

  const parsedReservationTime = parseInt(reservationTime, 10) + 12;
  const reservationRecord = {
    name,
    time: parsedReservationTime,
    phone: twilioData.From,
    date: reservationDate
  };
  const todaysDate = Date.now();
  const oneHour = 1;
  const closingTime = 22;
  const openingTime = 13;

  if (reservationDate < todaysDate) {
    return `Looks like you made a mistake on the date. Can't make a reservation for a past date.`;
  }
  console.log('this is parsedReservationtime', parsedReservationTime);
  console.log(reservationRecord);
  if (
    parsedReservationTime < openingTime ||
    parsedReservationTime >= closingTime
  ) {
    return 'Sorry the restaurant is closed at that time.';
  }

  try {
    const takenReservation = await Reservations.findOne({
      where: {
        date: reservationDate,
        [Op.or]: [
          {time: {[Op.gte]: parsedReservationTime}},
          {time: {[Op.lt]: parsedReservationTime + oneHour}}
        ]
      }
    });
    console.log('this is taken reservation', takenReservation);
    if (takenReservation) {
      return `Sorry, a reservation for ${reservationTime} has already been taken.`;
    }

    const newReservation = await Reservations.create(reservationRecord);

    if (newReservation) {
      return `Reservation at ${reservationTime} on ${date} confirmed.`;
    }

    console.log(`Reservation at ${reservationTime} on ${date} confirmed.`);
  } catch (error) {
    return `Sorry, there was an issue creating your reservation`;
  }
};
module.exports = createReservation;
