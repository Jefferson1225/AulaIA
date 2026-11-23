export type UserRole = "student" | "teacher" | "admin";

export interface Profile {
  id: string;
  fullName: string;
  role: UserRole;
}
