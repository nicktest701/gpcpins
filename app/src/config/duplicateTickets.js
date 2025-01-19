import _ from 'lodash';


export const duplicateTickets = (tickets) => {
  const no = tickets?.flatMap((item) => {
    let array = [];
    _.times(item.quantity, () => array.push(item.type));

    return array;
  });

  return no;
};

