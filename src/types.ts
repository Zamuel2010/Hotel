export interface Room {
  id: string;
  name: string;
  description: string;
  price: number;
  size: string;
  occupancy: number;
  available: number;
  image: string;
}

export interface BookingDetails {
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  email: string;
}
