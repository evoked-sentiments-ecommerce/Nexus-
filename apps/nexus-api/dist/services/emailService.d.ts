import { WelcomeEmailData } from "../templates/welcomeEmail";
import { PaymentReceiptData } from "../templates/paymentReceipt";
import { BlueprintReadyData } from "../templates/blueprintReady";
import { PackageReadyData } from "../templates/packageReady";
interface SendResult {
    id: string;
}
/**
 * Send a welcome email to a newly registered user.
 */
export declare function sendWelcomeEmail(data: WelcomeEmailData): Promise<SendResult>;
/**
 * Send a payment receipt after a successful billing charge.
 */
export declare function sendPaymentReceipt(data: PaymentReceiptData): Promise<SendResult>;
/**
 * Notify a user that their Chef Drew hospitality blueprint is ready.
 */
export declare function sendBlueprintReadyNotification(to: string, data: BlueprintReadyData): Promise<SendResult>;
/**
 * Notify a user that their asset package is ready to download.
 */
export declare function sendPackageDownloadNotification(to: string, data: PackageReadyData): Promise<SendResult>;
export type { WelcomeEmailData, PaymentReceiptData, BlueprintReadyData, PackageReadyData, };
//# sourceMappingURL=emailService.d.ts.map