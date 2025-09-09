import { useState, useCallback } from "react";
import { StockItem, StockReceipt, StockConsumption } from "@/types/inventory";
import { 
  sampleStockItems, 
  sampleStockReceipts, 
  sampleStockConsumption 
} from "@/data/sampleData";

export const useInventoryStore = () => {
  const [stockItems, setStockItems] = useState<StockItem[]>(sampleStockItems);
  const [stockReceipts, setStockReceipts] = useState<StockReceipt[]>(sampleStockReceipts);
  const [stockConsumption, setStockConsumption] = useState<StockConsumption[]>(sampleStockConsumption);

  const addStockReceipt = useCallback((receipt: Omit<StockReceipt, 'id' | 'createdAt'>) => {
    const newReceipt: StockReceipt = {
      ...receipt,
      id: `R${String(Date.now()).slice(-6)}`,
      createdAt: new Date().toISOString(),
    };

    setStockReceipts(prev => [newReceipt, ...prev]);

    // Update stock levels
    setStockItems(prev => prev.map(item => {
      if (item.itemCode === newReceipt.itemCode) {
        return {
          ...item,
          currentQuantity: item.currentQuantity + newReceipt.quantityReceived,
          rate: newReceipt.ratePerUnit, // Update rate to latest
        };
      }
      return item;
    }));
  }, []);

  const addStockConsumption = useCallback((consumption: Omit<StockConsumption, 'id' | 'createdAt' | 'ratePerUnit' | 'totalValue'>) => {
    const stockItem = stockItems.find(item => item.itemCode === consumption.itemCode);
    
    if (!stockItem || stockItem.currentQuantity < consumption.quantityUsed) {
      throw new Error("Insufficient stock available");
    }

    const newConsumption: StockConsumption = {
      ...consumption,
      id: `C${String(Date.now()).slice(-6)}`,
      createdAt: new Date().toISOString(),
      ratePerUnit: stockItem.rate,
      totalValue: consumption.quantityUsed * stockItem.rate,
    };

    setStockConsumption(prev => [newConsumption, ...prev]);

    // Update stock levels
    setStockItems(prev => prev.map(item => {
      if (item.itemCode === consumption.itemCode) {
        return {
          ...item,
          currentQuantity: item.currentQuantity - consumption.quantityUsed,
        };
      }
      return item;
    }));

    return newConsumption;
  }, [stockItems]);

  const getInventoryReports = useCallback(() => {
    return stockItems.map(item => {
      const totalReceived = stockReceipts
        .filter(r => r.itemCode === item.itemCode)
        .reduce((sum, r) => sum + r.quantityReceived, 0);
      
      const totalConsumed = stockConsumption
        .filter(c => c.itemCode === item.itemCode)
        .reduce((sum, c) => sum + c.quantityUsed, 0);

      return {
        itemName: item.itemName,
        itemCode: item.itemCode,
        totalReceived,
        totalConsumed,
        currentStock: item.currentQuantity,
        currentValue: item.currentQuantity * item.rate,
        unitOfMeasurement: item.unitOfMeasurement,
      };
    });
  }, [stockItems, stockReceipts, stockConsumption]);

  return {
    stockItems,
    stockReceipts,
    stockConsumption,
    addStockReceipt,
    addStockConsumption,
    getInventoryReports,
  };
};