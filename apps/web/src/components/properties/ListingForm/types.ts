export type Address = {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type Coordinates = {
  lat: number;
  lng: number;
};

export type ListingFormValues = {
  title: string;
  description: string;
  price: number;
  location: Coordinates;
  address: Address;
  amenities: string[];
  photos: (File | string)[];
};
