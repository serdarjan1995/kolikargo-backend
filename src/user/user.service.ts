import { HttpException, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserModel } from './models/user.model';
import { AuthCodeModel } from './models/authCode.model';
import { InjectTwilio, TwilioClient } from 'nestjs-twilio';

const userProjection = {
  __v: false,
};

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserModel>,
    @InjectModel('AuthCode')
    private readonly authCodeModel: Model<AuthCodeModel>,
    @InjectTwilio() private readonly twilioClient: TwilioClient,
  ) {}

  public async getUsers(name): Promise<UserModel[]> {
    const filters = {};
    if (name) {
      filters['name'] = name;
    }
    return await this.userModel.find(filters, userProjection).exec();
  }

  public async createUser(newUser: UserModel): Promise<UserModel> {
    const user = await this.userModel.create(newUser);
    await user.validate();
    return user.save();
  }

  public async getUser(id): Promise<UserModel> {
    const user = await this.userModel
      .findOne({ _id: id }, userProjection)
      .exec();
    if (!user) {
      throw new HttpException('Not Found', 404);
    }
    return user;
  }

  public async getUserBy(
    filter: object,
    raiseException = true,
  ): Promise<UserModel> {
    const user = await this.userModel.findOne(filter, userProjection).exec();
    if (!user && raiseException) {
      throw new HttpException('Not Found', 404);
    }
    return user;
  }

  public async updateUser(id, name, surname): Promise<UserModel> {
    const user = await this.userModel
      .findOneAndUpdate({ _id: id }, { name, surname })
      .exec();
    if (!user) {
      throw new HttpException('Not Found', 404);
    }
    return user;
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

  async refreshCode(phoneNumber: string): Promise<any> {
    const user = await this.getUserBy({ phoneNumber: phoneNumber });
    if (!user) {
      if (!user) {
        throw new HttpException('Number has not been registered', 404);
      }
    }

    const now = new Date();
    const currentCode = await this.authCodeModel
      .findOne({ phoneNumber: phoneNumber })
      .exec();
    if (!currentCode || currentCode.expires < now) {
      const newCode = this.generateCode(6);
      const minutes = 5;
      const expiresAt = new Date(now.getTime() + minutes * 60000);
      const newData = {
        expires: expiresAt,
        code: newCode,
        phoneNumber: phoneNumber,
      };
      await this.sendSMS(phoneNumber, newCode);
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

  async sendSMS(phoneNumber, code) {
    return await this.twilioClient.messages.create({
      body: `Please enter your code: ${code} to continue`,
      from: process.env.TWILIO_NUMBER,
      to: phoneNumber,
    });
  }

  generateCode(length: number): number {
    let result = '';
    const characters = '0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return Number(result);
  }
}
