import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserModel, UserRegister } from './models/user.model';
import { AuthCodeModel } from './models/authCode.model';
import { InjectTwilio, TwilioClient } from 'nestjs-twilio';
import { Role } from '../auth/role.enum';
import { HttpService } from '@nestjs/axios';
import { generateCode } from '../utils';
import { CargoSupplierModel } from '../cargo-supplier/models/cargoSupplier.model';
import { LoginType } from '../auth/auth.service';

const userProjection = {
  __v: false,
  _id: false,
  roles: false,
};

const SMS_API_USERID = process.env.SMS_API_USERID;
const SMS_API_USERNAME = process.env.SMS_API_USERNAME;
const SMS_API_PASSWORD = process.env.SMS_API_PASSWORD;
const SMS_API_NUMBER = process.env.SMS_API_NUMBER;

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserModel>,
    @InjectModel('AuthCode')
    private readonly authCodeModel: Model<AuthCodeModel>,
    @InjectTwilio() private readonly twilioClient: TwilioClient,
    private readonly httpService: HttpService,
  ) {}

  public async getUsers(name): Promise<UserModel[]> {
    const filters = {};
    if (name) {
      filters['name'] = { $regex: `.*${name}.*`, $options: 'i' };
    }
    return await this.userModel.find(filters, userProjection).exec();
  }

  public async createUser(newUser: UserRegister): Promise<UserModel> {
    const isPhoneNumberRegistered = await this.getUserBy(
      {
        phoneNumber: newUser.phoneNumber,
      },
      false,
    );
    if (isPhoneNumberRegistered) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Number has been already registered',
          errorCode: 'number_already_registered',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const user = await this.userModel.create({
      ...newUser,
      roles: [Role.User],
    });
    await user.validate();
    await user.save();
    return await this.getUser(user._id);
  }

  public async getUser(id): Promise<UserModel> {
    const user = await this.userModel
      .findOne({ _id: id }, userProjection)
      .exec();
    if (!user) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `User ${id} Not Found`,
          errorCode: 'user_not_found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return user;
  }

  public async getUserBy(
    filter: object,
    raiseException = true,
    useProjection = true,
  ): Promise<UserModel> {
    const user = await this.userModel
      .findOne(filter, useProjection ? userProjection : null)
      .exec();
    if (!user && raiseException) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `User Not Found`,
          errorCode: 'user_not_found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return user;
  }

  public async updateUser(userId, name, surname): Promise<UserModel> {
    const user = await this.userModel
      .findOneAndUpdate(
        { _id: await this.idToObjectId(userId) },
        { name, surname },
      )
      .exec();
    if (!user) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `User Not Found`,
          errorCode: 'user_not_found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return this.getUser(user._id);
  }

  async getAuthCode(phoneNumber: string): Promise<any> {
    return await this.authCodeModel
      .findOne({
        phoneNumber: phoneNumber,
        expires: {
          $gte: new Date(),
        },
      })
      .exec();
  }

  async expireAuthCode(phoneNumber: string): Promise<any> {
    return await this.authCodeModel
      .findOneAndUpdate({ phoneNumber: phoneNumber }, { expires: new Date() })
      .exec();
  }

  async refreshCode(
    phoneNumber: string,
    user: UserModel | CargoSupplierModel,
    type: LoginType,
  ): Promise<any> {
    const now = new Date();
    const currentCode = await this.authCodeModel
      .findOne({ phoneNumber: phoneNumber })
      .exec();
    if (!currentCode || currentCode.expires < now) {
      const useIsDev = user.roles?.includes(Role.Dev);
      const newCode = useIsDev ? 777777 : generateCode(6);
      const minutes = 2;
      const expiresAt = new Date(now.getTime() + minutes * 60000);
      const newData = {
        expires: expiresAt,
        code: newCode,
        phoneNumber: phoneNumber,
        type: type,
      };

      if (process.env.NODE_ENV === 'production') {
        if (!useIsDev) {
          await this.sendLoginCodeSMS(phoneNumber, newCode);
        }
      }

      if (!currentCode) {
        // create a new
        const authCode = await this.authCodeModel.create(newData);
        return authCode.save();
      } else {
        // update existing
        return this.authCodeModel.findByIdAndUpdate(currentCode.id, newData, {
          new: true,
        });
      }
    }
    return null;
  }

  async sendSMSTwilio(phoneNumber, code) {
    return await this.twilioClient.messages.create({
      body: `Please enter your code: ${code} to continue`,
      from: process.env.TWILIO_NUMBER,
      to: phoneNumber,
    });
  }

  async sendLoginCodeSMS(phoneNumber, code) {
    const zeroPaddedCode = ('000000' + code).slice(-6);
    const message = `${zeroPaddedCode} doğrulama kodu ile giriş yapabilirsiniz.\n\nKolikargo`;
    console.info('sent login code', phoneNumber, message);
    return this.sendSMS(phoneNumber, message);
  }

  async sendSMS(phoneNumber, message) {
    const encodedMessage = encodeURI(this.encodeSMSSpecialChars(message));
    const url =
      `http://panel.vatansms.com/panel/smsgonder1N.php?kno=${SMS_API_USERID}&kul_ad=${SMS_API_USERNAME}&` +
      `sifre=${SMS_API_PASSWORD}&gonderen=${SMS_API_NUMBER}&mesaj=${encodedMessage}&numaralar=${phoneNumber}&tur=Normal`;
    const res = await this.httpService.axiosRef.get(url);
    console.info(res.data);
    return res;
  }

  public encodeSMSSpecialChars(message: string): string {
    return message
      .replaceAll('@', '|01|')
      .replaceAll('£', '|02|')
      .replaceAll('$', '|03|')
      .replaceAll('€', '|04|')
      .replaceAll('_', '|14|')
      .replaceAll('!', '|26|')
      .replaceAll("'", '|27|')
      .replaceAll('#', '|28|')
      .replaceAll('%', '|30|')
      .replaceAll('&', '|31|')
      .replaceAll('(', '|33|')
      .replaceAll('(', '|34|')
      .replaceAll('*', '|35|')
      .replaceAll('+', '|36|')
      .replaceAll('-', '|38|')
      .replaceAll(':', '|40|')
      .replaceAll(';', '|41|')
      .replaceAll('<', '|42|')
      .replaceAll('=', '|43|')
      .replaceAll('>', '|44|')
      .replaceAll('?', '|45|')
      .replaceAll('{', '|46|')
      .replaceAll('}', '|47|')
      .replaceAll('~', '|49|')
      .replaceAll('^', '|51|')
      .replaceAll('ö', '|62|')
      .replaceAll('ü', '|63|')
      .replaceAll('ç', '|64|')
      .replaceAll('ş', '|65|')
      .replaceAll('ğ', '|66|')
      .replaceAll('ı', '|67|')
      .replaceAll('Ö', '|68|')
      .replaceAll('Ü', '|69|')
      .replaceAll('Ç', '|70|')
      .replaceAll('Ş', '|71|')
      .replaceAll('İ', '|72|')
      .replaceAll('Ğ', '|73|')
      .replaceAll('\n', '|61|');
  }

  generateCode(length: number): number {
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
  }

  public async idToObjectId(id: string): Promise<Types.ObjectId> {
    if (!id) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `User id should be specified`,
          errorCode: 'user_not_found',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const user = await this.userModel.findOne({ id: id }).exec();
    if (!user) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `User ${id} Not Found`,
          errorCode: 'user_not_found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return user._id;
  }
}
