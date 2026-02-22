import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  gatewaySecret: string;
  services: {
    location: string;
    message: string;
  };
  rateLimit: {
    default: {
      windowMs: number;
      max: number;
    };
    health: {
      windowMs: number;
      max: number;
    };
  };
}

class ConfigService {
  private config: Config;

  constructor() {
    this.config = {
      port: this.getEnvAsNumber('PORT'),
      nodeEnv: this.getEnv('NODE_ENV'),
      gatewaySecret: this.getEnv('GATEWAY_SECRET'),
      services: {
        location: this.getEnv('LOCATION_SERVICE_URL'),
        message: this.getEnv('MESSAGE_SERVICE_URL'),
      },
      rateLimit: {
        default: {
          windowMs: this.getEnvAsNumber('RATE_LIMIT_WINDOW_MS'),
          max: this.getEnvAsNumber('RATE_LIMIT_MAX'),
        },
        health: {
          windowMs: this.getEnvAsNumber('RATE_LIMIT_HEALTH_WINDOW_MS'),
          max: this.getEnvAsNumber('RATE_LIMIT_HEALTH_MAX'),
        },
      },
    };

    if (this.isDevelopment) {
      console.log('📋 Configuration loaded:');
      console.log(`   PORT: ${this.config.port}`);
      console.log(`   NODE_ENV: ${this.config.nodeEnv}`);
      console.log(`   LOCATION_SERVICE_URL: ${this.config.services.location}`);
      console.log(`   MESSAGE_SERVICE_URL: ${this.config.services.message}`);
    }
  }

  private getEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
  }

  private getEnvAsNumber(key: string): number {
    const value = this.getEnv(key);
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      throw new Error(`Environment variable ${key} must be a valid number, got: ${value}`);
    }
    return parsed;
  }

  get port(): number {
    return this.config.port;
  }

  get nodeEnv(): string {
    return this.config.nodeEnv;
  }

  get isDevelopment(): boolean {
    return this.config.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.config.nodeEnv === 'production';
  }

  get gatewaySecret(): string {
    return this.config.gatewaySecret;
  }

  get services() {
    return this.config.services;
  }

  get rateLimit() {
    return this.config.rateLimit;
  }
}

export default new ConfigService();
