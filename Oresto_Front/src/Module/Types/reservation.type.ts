import { Table } from './table.type';

// reservation.type.ts
export interface Reservation {
  _id: string;
  date_selected: string;
  time_selected: string;
  nbr_persons: number;
  details: string;
  status: 'waiting' | 'confirmed' | 'canceled' | 'occupied';
  restaurant_id: string;
  table_id: string;
  table_number: string;
  user_id: {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    phone_number: string;
    role: string;
    restaurant_id: string | null;
    allergens: string[];
    created_at: string;
    __v: number;
    token: string;
    id: string;
  };
  created_at: string;
  __v: number;
  table: Table;
  id: string;
}
