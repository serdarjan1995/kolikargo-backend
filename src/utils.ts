export const getRandomStr = (length, addLetters = false) => {
  let result = '';
  const characters =
    '0123456789' + addLetters ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};