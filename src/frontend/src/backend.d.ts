import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface LoanApplication {
    status: ApplicationStatus;
    applicantName: string;
    contactInfo: string;
    loanAmount: number;
    applicationId: bigint;
    income: number;
    employmentDetails: string;
    applicationDate: bigint;
    loanPurpose: string;
}
export interface UserProfile {
    name: string;
}
export enum ApplicationStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteLoanApplication(applicationId: bigint): Promise<void>;
    getAllLoanApplications(): Promise<Array<LoanApplication>>;
    getApplicationsByStatus(status: ApplicationStatus): Promise<Array<LoanApplication>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getLoanApplicationById(applicationId: bigint): Promise<LoanApplication>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitLoanApplication(applicantName: string, contactInfo: string, loanAmount: number, loanPurpose: string, employmentDetails: string, income: number): Promise<bigint>;
    updateApplicationStatus(applicationId: bigint, newStatus: ApplicationStatus): Promise<void>;
    updateLoanApplication(applicationId: bigint, applicantName: string, contactInfo: string, loanAmount: number, loanPurpose: string, employmentDetails: string, income: number): Promise<void>;
}
