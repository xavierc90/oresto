import { Company } from "../Types";

export type User = {
  _id: string;
  table_id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  phone_number: string;
  allergens: string[];
  created_at: string;
  company_id: string;
  token?: string;
  status?: string;
  bookingCount?: number;
  restaurant?: Company[];
};
