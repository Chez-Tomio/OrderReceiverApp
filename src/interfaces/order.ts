export interface Order {
    id: string;
    time: string;
    contactPhoneNumber: string;
    completed: boolean;
    products: {
        id: string;
        title: string;
        extras: {
            id: string;
            title: string;
        }[];
    }[];
}
