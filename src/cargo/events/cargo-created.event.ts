export class CargoCreatedEvent {
  cargoSupplierName: string;
  cargoTrackingNumber: string;
  userPhoneNumber: string;
}

export class CargoCreatedSupplierEvent {
  cargoSupplierName: string;
  cargoSupplierPhoneNumber: string;
  link: string;
}
