import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInventoryStore } from "@/hooks/useInventoryStore";
import { useToast } from "@/hooks/use-toast";
import { sampleStockItems, suppliers, workers } from "@/data/sampleData";
import { PackagePlus, Calculator } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const StockReceipt = () => {
  const { addStockReceipt, stockReceipts } = useInventoryStore();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    itemName: "",
    itemCode: "",
    quantityReceived: "",
    ratePerUnit: "",
    unitOfMeasurement: "",
    supplierName: "",
    deliveryDate: "",
    receivedBy: "",
    createdBy: "Current User", // In real app, this would come from auth
  });

  const [totalValue, setTotalValue] = useState(0);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-calculate total value
    if (field === "quantityReceived" || field === "ratePerUnit") {
      const quantity = field === "quantityReceived" ? parseFloat(value) || 0 : parseFloat(formData.quantityReceived) || 0;
      const rate = field === "ratePerUnit" ? parseFloat(value) || 0 : parseFloat(formData.ratePerUnit) || 0;
      setTotalValue(quantity * rate);
    }
  };

  const handleItemSelect = (itemCode: string) => {
    const item = sampleStockItems.find(i => i.itemCode === itemCode);
    if (item) {
      setFormData(prev => ({
        ...prev,
        itemCode: item.itemCode,
        itemName: item.itemName,
        unitOfMeasurement: item.unitOfMeasurement,
        ratePerUnit: item.rate.toString(),
      }));
      
      const quantity = parseFloat(formData.quantityReceived) || 0;
      setTotalValue(quantity * item.rate);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      addStockReceipt({
        ...formData,
        quantityReceived: parseFloat(formData.quantityReceived),
        ratePerUnit: parseFloat(formData.ratePerUnit),
        totalValue,
      });

      toast({
        title: "Stock Receipt Added",
        description: `Successfully recorded ${formData.quantityReceived} ${formData.unitOfMeasurement} of ${formData.itemName}`,
      });

      // Reset form
      setFormData({
        itemName: "",
        itemCode: "",
        quantityReceived: "",
        ratePerUnit: "",
        unitOfMeasurement: "",
        supplierName: "",
        deliveryDate: "",
        receivedBy: "",
        createdBy: "Current User",
      });
      setTotalValue(0);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add stock receipt. Please try again.",
      });
    }
  };

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Stock Receipt</h1>
        <p className="text-muted-foreground">Record incoming inventory and materials</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Receipt Form */}
        <div className="lg:col-span-2">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PackagePlus className="h-5 w-5 text-accent" />
                <span>New Stock Receipt</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="itemCode">Item Code</Label>
                    <Select value={formData.itemCode} onValueChange={handleItemSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select item code" />
                      </SelectTrigger>
                      <SelectContent>
                        {sampleStockItems.map((item) => (
                          <SelectItem key={item.itemCode} value={item.itemCode}>
                            {item.itemCode} - {item.itemName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="itemName">Item Name</Label>
                    <Input
                      id="itemName"
                      value={formData.itemName}
                      onChange={(e) => handleInputChange("itemName", e.target.value)}
                      placeholder="Enter item name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantityReceived">Quantity Received</Label>
                    <Input
                      id="quantityReceived"
                      type="number"
                      step="0.01"
                      value={formData.quantityReceived}
                      onChange={(e) => handleInputChange("quantityReceived", e.target.value)}
                      placeholder="Enter quantity"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unitOfMeasurement">Unit of Measurement</Label>
                    <Input
                      id="unitOfMeasurement"
                      value={formData.unitOfMeasurement}
                      onChange={(e) => handleInputChange("unitOfMeasurement", e.target.value)}
                      placeholder="e.g., Bags, Kg, Pieces"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ratePerUnit">Rate per Unit</Label>
                    <Input
                      id="ratePerUnit"
                      type="number"
                      step="0.01"
                      value={formData.ratePerUnit}
                      onChange={(e) => handleInputChange("ratePerUnit", e.target.value)}
                      placeholder="Enter rate"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Total Value</Label>
                    <div className="flex items-center space-x-2 p-3 bg-success/10 rounded-lg border border-success/20">
                      <Calculator className="h-4 w-4 text-success" />
                      <span className="text-lg font-bold text-success">{formatCurrency(totalValue)}</span>
                      <span className="text-sm text-muted-foreground">(Auto-calculated)</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supplierName">Supplier Name</Label>
                    <Select value={formData.supplierName} onValueChange={(value) => handleInputChange("supplierName", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier} value={supplier}>
                            {supplier}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveryDate">Delivery Date</Label>
                    <Input
                      id="deliveryDate"
                      type="date"
                      value={formData.deliveryDate}
                      onChange={(e) => handleInputChange("deliveryDate", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="receivedBy">Received By</Label>
                    <Select value={formData.receivedBy} onValueChange={(value) => handleInputChange("receivedBy", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select worker" />
                      </SelectTrigger>
                      <SelectContent>
                        {workers.map((worker) => (
                          <SelectItem key={worker} value={worker}>
                            {worker}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-gradient-accent hover:bg-accent-hover">
                  <PackagePlus className="h-4 w-4 mr-2" />
                  Add Stock Receipt
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Recent Receipts */}
        <div>
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Recent Receipts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stockReceipts.slice(0, 10).map((receipt) => (
                  <div key={receipt.id} className="p-3 bg-muted rounded-lg border border-border">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-foreground">{receipt.itemName}</h4>
                      <Badge variant="secondary">{receipt.id}</Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Quantity: {receipt.quantityReceived} {receipt.unitOfMeasurement}</p>
                      <p>Value: <span className="font-bold text-success">{formatCurrency(receipt.totalValue)}</span></p>
                      <p>Supplier: {receipt.supplierName}</p>
                      <p>Date: {formatDate(receipt.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StockReceipt;