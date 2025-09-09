import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useInventoryStore } from "@/hooks/useInventoryStore";
import { useToast } from "@/hooks/use-toast";
import { activityCodes, workers } from "@/data/sampleData";
import { PackageMinus, AlertTriangle, Calculator } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const StockConsumption = () => {
  const { stockItems, addStockConsumption, stockConsumption } = useInventoryStore();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    itemCode: "",
    quantityUsed: "",
    purposeActivityCode: "",
    usedBy: "",
    date: "",
    remarks: "",
    createdBy: "Current User",
  });

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [estimatedValue, setEstimatedValue] = useState(0);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Calculate estimated value
    if (field === "quantityUsed" && selectedItem) {
      const quantity = parseFloat(value) || 0;
      setEstimatedValue(quantity * selectedItem.rate);
    }
  };

  const handleItemSelect = (itemCode: string) => {
    const item = stockItems.find(i => i.itemCode === itemCode);
    if (item) {
      setSelectedItem(item);
      setFormData(prev => ({ ...prev, itemCode }));
      
      const quantity = parseFloat(formData.quantityUsed) || 0;
      setEstimatedValue(quantity * item.rate);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedItem) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select an item",
      });
      return;
    }

    const quantityUsed = parseFloat(formData.quantityUsed);
    
    if (quantityUsed > selectedItem.currentQuantity) {
      toast({
        variant: "destructive",
        title: "Insufficient Stock",
        description: `Only ${selectedItem.currentQuantity} ${selectedItem.unitOfMeasurement} available. Cannot consume ${quantityUsed} ${selectedItem.unitOfMeasurement}.`,
      });
      return;
    }

    try {
      addStockConsumption({
        itemName: selectedItem.itemName,
        itemCode: formData.itemCode,
        quantityUsed,
        purposeActivityCode: formData.purposeActivityCode,
        usedBy: formData.usedBy,
        date: formData.date,
        remarks: formData.remarks,
        unitOfMeasurement: selectedItem.unitOfMeasurement,
        createdBy: formData.createdBy,
      });

      toast({
        title: "Stock Consumption Recorded",
        description: `Successfully recorded consumption of ${quantityUsed} ${selectedItem.unitOfMeasurement} of ${selectedItem.itemName}`,
      });

      // Reset form
      setFormData({
        itemCode: "",
        quantityUsed: "",
        purposeActivityCode: "",
        usedBy: "",
        date: "",
        remarks: "",
        createdBy: "Current User",
      });
      setSelectedItem(null);
      setEstimatedValue(0);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to record stock consumption",
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
        <h1 className="text-3xl font-bold text-foreground">Stock Consumption</h1>
        <p className="text-muted-foreground">Record materials usage and consumption</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Consumption Form */}
        <div className="lg:col-span-2">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PackageMinus className="h-5 w-5 text-destructive" />
                <span>Record Stock Consumption</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="itemCode">Select Item</Label>
                    <Select value={formData.itemCode} onValueChange={handleItemSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose item to consume" />
                      </SelectTrigger>
                      <SelectContent>
                        {stockItems.map((item) => (
                          <SelectItem key={item.itemCode} value={item.itemCode}>
                            {item.itemCode} - {item.itemName}
                            <span className="ml-2 text-muted-foreground">
                              (Available: {item.currentQuantity} {item.unitOfMeasurement})
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedItem && (
                    <div className="space-y-2">
                      <Label>Current Stock</Label>
                      <div className="p-3 bg-muted rounded-lg border border-border">
                        <p className="font-medium text-foreground">{selectedItem.itemName}</p>
                        <p className="text-sm text-muted-foreground">
                          Available: <span className="font-bold text-success">{selectedItem.currentQuantity} {selectedItem.unitOfMeasurement}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Rate: {formatCurrency(selectedItem.rate)} per {selectedItem.unitOfMeasurement}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="quantityUsed">Quantity Used</Label>
                    <Input
                      id="quantityUsed"
                      type="number"
                      step="0.01"
                      value={formData.quantityUsed}
                      onChange={(e) => handleInputChange("quantityUsed", e.target.value)}
                      placeholder="Enter quantity to consume"
                      required
                      max={selectedItem?.currentQuantity || undefined}
                    />
                    {selectedItem && parseFloat(formData.quantityUsed) > selectedItem.currentQuantity && (
                      <div className="flex items-center space-x-1 text-destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm">Insufficient stock available</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Estimated Value</Label>
                    <div className="flex items-center space-x-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                      <Calculator className="h-4 w-4 text-destructive" />
                      <span className="text-lg font-bold text-destructive">{formatCurrency(estimatedValue)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="purposeActivityCode">Activity Code</Label>
                    <Select value={formData.purposeActivityCode} onValueChange={(value) => handleInputChange("purposeActivityCode", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select activity" />
                      </SelectTrigger>
                      <SelectContent>
                        {activityCodes.map((activity) => (
                          <SelectItem key={activity.code} value={activity.code}>
                            {activity.code} - {activity.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="usedBy">Used By</Label>
                    <Select value={formData.usedBy} onValueChange={(value) => handleInputChange("usedBy", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select worker/team" />
                      </SelectTrigger>
                      <SelectContent>
                        {workers.map((worker) => (
                          <SelectItem key={worker} value={worker}>
                            {worker}
                          </SelectItem>
                        ))}
                        <SelectItem value="Construction Team A">Construction Team A</SelectItem>
                        <SelectItem value="Construction Team B">Construction Team B</SelectItem>
                        <SelectItem value="Masonry Team">Masonry Team</SelectItem>
                        <SelectItem value="Electrical Team">Electrical Team</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange("date", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    value={formData.remarks}
                    onChange={(e) => handleInputChange("remarks", e.target.value)}
                    placeholder="Add any additional notes or comments about this consumption"
                    rows={3}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-primary hover:bg-primary-hover"
                  disabled={!selectedItem || !formData.quantityUsed || parseFloat(formData.quantityUsed) > (selectedItem?.currentQuantity || 0)}
                >
                  <PackageMinus className="h-4 w-4 mr-2" />
                  Record Consumption
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Recent Consumption */}
        <div>
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Recent Consumption</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stockConsumption.slice(0, 10).map((consumption) => (
                  <div key={consumption.id} className="p-3 bg-muted rounded-lg border border-border">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-foreground">{consumption.itemName}</h4>
                      <Badge variant="outline">{consumption.id}</Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Used: {consumption.quantityUsed} {consumption.unitOfMeasurement}</p>
                      <p>Value: <span className="font-bold text-destructive">{formatCurrency(consumption.totalValue)}</span></p>
                      <p>Activity: <Badge variant="secondary" className="text-xs">{consumption.purposeActivityCode}</Badge></p>
                      <p>Used by: {consumption.usedBy}</p>
                      <p>Date: {formatDate(consumption.createdAt)}</p>
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

export default StockConsumption;