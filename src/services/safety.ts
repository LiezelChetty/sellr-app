import { ReportInput } from "../types/domain";
export interface SafetyService {
  report(input: ReportInput): Promise<void>;
  blockUser(userId: string): Promise<void>;
  unblockUser(userId: string): Promise<void>;
}
export class LocalDemoSafetyService implements SafetyService {
  async report(): Promise<void> {
    throw new Error("Reports are not sent in local demo mode.");
  }
  async blockUser(): Promise<void> {
    throw new Error("Blocking requires authenticated backend storage.");
  }
  async unblockUser(): Promise<void> {
    throw new Error("Blocking requires authenticated backend storage.");
  }
}
export const safetyService: SafetyService = new LocalDemoSafetyService();
