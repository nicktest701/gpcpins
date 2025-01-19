export function hidePhoneNumber(number) {
  const firstTwo =
    number?.length === 10 ? number?.slice(0, 2) : number?.slice(0, 5);
  const lastTwo = number?.slice(-2);

  return `${firstTwo}*****${lastTwo}`;
}


export function hideNID(number) {
  const first = number?.slice(0, 5);
  const last = number?.slice(-2);

  return `${first}*****${last}`;
}

export function hidePin(number) {
  const first = number?.slice(0, 3);
  const last = number?.slice(-2);

  return `${first}*****${last}`;
}
