export const getRandomStr = (length, addLetters = false) => {
  let result = '';
  let characters = '0123456789';
  if (addLetters) {
    characters += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  }
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const censorString = (s: string, fromStart = 2, fromEnd = 0) => {
  if (!s?.length) return s;

  let censoredString: string;
  if (fromEnd == 0) {
    censoredString =
      s.substring(0, fromStart) + '*'.repeat(Math.abs(s.length - fromStart));
  } else {
    censoredString =
      s.substring(0, fromStart) +
      '*'.repeat(Math.abs(s.length - fromStart - fromEnd)) +
      s.substring(s.length - fromEnd, s.length);
  }

  return censoredString;
};
