export interface StockItem {
  id: string;
  itemName: string;
  itemCode: string;
  currentQuantity: number;
  unitOfMeasurement: string;
  rate: number;
}

export interface StockReceipt {
  id: string;
  itemName: string;
  itemCode: string;
  quantityReceived: number;
  ratePerUnit: number;
  unitOfMeasurement: string;
  totalValue: number;
  supplierName: string;
  deliveryDate: string;
  receivedBy: string;
  createdAt: string;
  createdBy: string;
  editedAt?: string;
  editedBy?: string;
}

export interface StockConsumption {
  id: string;
  itemName: string;
  itemCode: string;
  quantityUsed: number;
  purposeActivityCode: string;
  usedBy: string;
  date: string;
  remarks: string;
  unitOfMeasurement: string;
  ratePerUnit: number;
  totalValue: number;
  createdAt: string;
  createdBy: string;
  editedAt?: string;
  editedBy?: string;
}

export interface InventoryReport {
  itemName: string;
  itemCode: string;
  totalReceived: number;
  totalConsumed: number;
  currentStock: number;
  currentValue: number;
  unitOfMeasurement: string;
}