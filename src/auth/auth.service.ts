import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OAuth2Client } from 'google-auth-library';
import { User, UserDocument } from './schemas/user.schema';
import { GoogleAuthDto, GoogleUserInfo } from './dto/google-auth.dto';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  async verifyGoogleToken(idToken: string): Promise<GoogleUserInfo> {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      
      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Invalid Google token');
      }

      return {
        sub: payload.sub!,
        email: payload.email!,
        name: payload.name!,
        picture: payload.picture,
        email_verified: payload.email_verified!,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  async findOrCreateUser(googleUserInfo: GoogleUserInfo): Promise<User> {
    let user = await this.userModel.findOne({ googleId: googleUserInfo.sub });

    if (!user) {
      // Create new user
      user = new this.userModel({
        email: googleUserInfo.email,
        name: googleUserInfo.name,
        picture: googleUserInfo.picture,
        googleId: googleUserInfo.sub,
        lastLoginAt: new Date(),
      });
      await user.save();
    } else {
      // Update existing user's last login
      user.lastLoginAt = new Date();
      user.name = googleUserInfo.name;
      user.picture = googleUserInfo.picture;
      await user.save();
    }

    return user;
  }

  async generateJwtToken(user: User): Promise<string> {
    const payload = {
      sub: (user as any)._id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }

  async googleLogin(googleAuthDto: GoogleAuthDto) {
    const googleUserInfo = await this.verifyGoogleToken(googleAuthDto.idToken);
    const user = await this.findOrCreateUser(googleUserInfo);
    const token = await this.generateJwtToken(user);
    console.log(token);
    return {
      access_token: token,
      user: {
        id: (user as any)._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        role: user.role,
      },
    };
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }
    return user;
  }
} 