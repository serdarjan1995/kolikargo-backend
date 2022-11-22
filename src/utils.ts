import { HttpException, HttpStatus } from '@nestjs/common';

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

export const checkNumber = (phoneNumber) => {
  const regex = /^\+905[0-9]{9}$/g;
  if (!phoneNumber.match(regex)) {
    throw new HttpException(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid number. Should be +905xxxxxxxxx',
        errorCode: 'phone_number_validation_error',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
};

export const generateCode = (length: number): number => {
  if (process.env.NODE_ENV !== 'production') {
    return 777777;
  }
  let result = '';
  const characters = '0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return Number(result);
};
