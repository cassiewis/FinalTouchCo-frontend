
export interface Reservation {
    status: string; // active, canceled, or fufilled
    reservationId: string; // generate random number
    name: string;
    dates: Date[];
    pickupNotes: string;
    items: ReservedItem[];
    email: string;
    phoneNumber: string;
    customerNotes: string;
    price: number;
    deposit: number;
    reservedOn: Date | null;
    invoiceStatus: string;
    paymentStatus: string;
    depositStatus: string;
    myNotes: string;
}

export interface ReservedItem {
    productId: string;
    quantity: number;
    name: string;
    price: number;
    deposit: number;
    description: string;
}