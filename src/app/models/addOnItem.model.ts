
export interface AddOnItem {
    type: string;
    itemId: string;
    active: boolean;
    quantity: number;
    name: string;
    price: number;
    deposit: number,
    description: string;
    imageUrl: string;
    datesReserved: Date[];
    tags: string[];
    material: string;
}