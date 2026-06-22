export interface WelcomeEmailData {
    name: string;
    email: string;
    loginUrl?: string;
}
export declare function welcomeEmailSubject(): string;
export declare function welcomeEmailHtml(data: WelcomeEmailData): string;
export declare function welcomeEmailText(data: WelcomeEmailData): string;
//# sourceMappingURL=welcomeEmail.d.ts.map