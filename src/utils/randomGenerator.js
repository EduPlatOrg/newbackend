export const randomPinNumber = (length=8) => {
  let pin = '';

  for (let i = 0; i < length; i++) {
    pin += Math.floor(Math.random() * 10);
  }

  return pin;
};
