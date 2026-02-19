import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type ApplicationStatus = {
    #pending;
    #approved;
    #rejected;
  };

  module ApplicationStatus {
    public func compare(s1 : ApplicationStatus, s2 : ApplicationStatus) : Order.Order {
      switch (s1, s2) {
        case (#pending, #pending) { #equal };
        case (#pending, _) { #less };
        case (#approved, #pending) { #greater };
        case (#approved, #approved) { #equal };
        case (#approved, #rejected) { #less };
        case (#rejected, #rejected) { #equal };
        case (#rejected, _) { #greater };
      };
    };
  };

  type LoanApplication = {
    applicationId : Nat;
    applicantName : Text;
    contactInfo : Text;
    loanAmount : Float;
    loanPurpose : Text;
    employmentDetails : Text;
    income : Float;
    applicationDate : Int;
    status : ApplicationStatus;
  };

  module LoanApplication {
    public func compareByAmount(a1 : LoanApplication, a2 : LoanApplication) : Order.Order {
      Float.compare(a1.loanAmount, a2.loanAmount);
    };

    public func compareByIncome(a1 : LoanApplication, a2 : LoanApplication) : Order.Order {
      Float.compare(a1.income, a2.income);
    };
  };

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let applications = Map.empty<Nat, LoanApplication>();
  var nextApplicationId = 1;

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func submitLoanApplication(
    applicantName : Text,
    contactInfo : Text,
    loanAmount : Float,
    loanPurpose : Text,
    employmentDetails : Text,
    income : Float
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can submit loan applications");
    };

    let currentTime = Time.now();

    let application : LoanApplication = {
      applicationId = nextApplicationId;
      applicantName;
      contactInfo;
      loanAmount;
      loanPurpose;
      employmentDetails;
      income;
      applicationDate = currentTime;
      status = #pending;
    };

    applications.add(nextApplicationId, application);
    nextApplicationId += 1;
    application.applicationId;
  };

  public query ({ caller }) func getAllLoanApplications() : async [LoanApplication] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all loan applications");
    };
    applications.values().toArray();
  };

  public query ({ caller }) func getLoanApplicationById(applicationId : Nat) : async LoanApplication {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view loan applications");
    };
    switch (applications.get(applicationId)) {
      case (null) { Runtime.trap("Loan application not found") };
      case (?application) { application };
    };
  };

  public shared ({ caller }) func updateApplicationStatus(applicationId : Nat, newStatus : ApplicationStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update application status");
    };
    switch (applications.get(applicationId)) {
      case (null) { Runtime.trap("Loan application not found") };
      case (?application) {
        let updatedApplication = {
          application with
          status = newStatus
        };
        applications.add(applicationId, updatedApplication);
      };
    };
  };

  public query ({ caller }) func getApplicationsByStatus(status : ApplicationStatus) : async [LoanApplication] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can filter loan applications");
    };
    let filtered = applications.values().toArray().filter(func(app) { app.status == status });
    filtered;
  };

  public shared ({ caller }) func deleteLoanApplication(applicationId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete loan applications");
    };
    if (not applications.containsKey(applicationId)) {
      Runtime.trap("Loan application not found");
    };
    applications.remove(applicationId);
  };

  public shared ({ caller }) func updateLoanApplication(
    applicationId : Nat,
    applicantName : Text,
    contactInfo : Text,
    loanAmount : Float,
    loanPurpose : Text,
    employmentDetails : Text,
    income : Float
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update loan applications");
    };
    switch (applications.get(applicationId)) {
      case (null) { Runtime.trap("Loan application not found") };
      case (?existingApplication) {
        let updatedApplication : LoanApplication = {
          applicationId = existingApplication.applicationId;
          applicantName;
          contactInfo;
          loanAmount;
          loanPurpose;
          employmentDetails;
          income;
          applicationDate = existingApplication.applicationDate;
          status = existingApplication.status;
        };
        applications.add(applicationId, updatedApplication);
      };
    };
  };
};
