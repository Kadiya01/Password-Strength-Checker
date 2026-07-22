import bcrypt from "bcrypt";
import { config } from "@/config";

export class HashService {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, config.BCRYPT_ROUNDS);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}

export const hashService = new HashService();
