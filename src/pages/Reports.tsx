import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInventoryStore } from "@/hooks/useInventoryStore";
import { FileText, Download, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Reports = () => {
  const { stockReceipts, stockConsumption, getInventoryReports } = useInventoryStore();
  const [dateFilter, setDateFilter] = useState({ startDate: "", endDate: "" });
  
  const inventoryReports = getInventoryReports();

  // Filter functions
  const getFilteredReceipts = () => {
    if (!dateFilter.startDate && !dateFilter.endDate) return stockReceipts;
    
    return stockReceipts.filter(receipt => {
      const receiptDate = new Date(receipt.deliveryDate);
      const start = dateFilter.startDate ? new Date(dateFilter.startDate) : new Date("1900-01-01");
      const end = dateFilter.endDate ? new Date(dateFilter.endDate) : new Date("2100-12-31");
      
      return receiptDate >= start && receiptDate <= end;
    });
  };

  const getFilteredConsumption = () => {
    if (!dateFilter.startDate && !dateFilter.endDate) return stockConsumption;
    
    return stockConsumption.filter(consumption => {
      const consumptionDate = new Date(consumption.date);
      const start = dateFilter.startDate ? new Date(dateFilter.startDate) : new Date("1900-01-01");
      const end = dateFilter.endDate ? new Date(dateFilter.endDate) : new Date("2100-12-31");
      
      return consumptionDate >= start && consumptionDate <= end;
    });
  };

  // Export functions
  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map(row => 
        headers.map(header => 
          typeof row[header] === 'string' && row[header].includes(',') 
            ? `"${row[header]}"` 
            : row[header]
        ).join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportReceiptReport = () => {
    const filteredReceipts = getFilteredReceipts();
    const exportData = filteredReceipts.map(receipt => ({
      ID: receipt.id,
      "Item Name": receipt.itemName,
      "Item Code": receipt.itemCode,
      "Quantity Received": receipt.quantityReceived,
      "Unit": receipt.unitOfMeasurement,
      "Rate per Unit": receipt.ratePerUnit,
      "Total Value": receipt.totalValue,
      "Supplier": receipt.supplierName,
      "Delivery Date": receipt.deliveryDate,
      "Received By": receipt.receivedBy,
      "Created At": new Date(receipt.createdAt).toLocaleString(),
      "Created By": receipt.createdBy,
    }));
    
    exportToCSV(exportData, `stock-receipts-${new Date().toISOString().split('T')[0]}`);
  };

  const exportConsumptionReport = () => {
    const filteredConsumption = getFilteredConsumption();
    const exportData = filteredConsumption.map(consumption => ({
      ID: consumption.id,
      "Item Name": consumption.itemName,
      "Item Code": consumption.itemCode,
      "Quantity Used": consumption.quantityUsed,
      "Unit": consumption.unitOfMeasurement,
      "Rate per Unit": consumption.ratePerUnit,
      "Total Value": consumption.totalValue,
      "Activity Code": consumption.purposeActivityCode,
      "Used By": consumption.usedBy,
      "Date": consumption.date,
      "Remarks": consumption.remarks,
      "Created At": new Date(consumption.createdAt).toLocaleString(),
      "Created By": consumption.createdBy,
    }));
    
    exportToCSV(exportData, `stock-consumption-${new Date().toISOString().split('T')[0]}`);
  };

  const exportValuationReport = () => {
    const exportData = inventoryReports.map(report => ({
      "Item Name": report.itemName,
      "Item Code": report.itemCode,
      "Total Received": report.totalReceived,
      "Total Consumed": report.totalConsumed,
      "Current Stock": report.currentStock,
      "Unit": report.unitOfMeasurement,
      "Current Value": report.currentValue,
    }));
    
    exportToCSV(exportData, `stock-valuation-${new Date().toISOString().split('T')[0]}`);
  };

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredReceipts = getFilteredReceipts();
  const filteredConsumption = getFilteredConsumption();

  const totalReceiptValue = filteredReceipts.reduce((sum, r) => sum + r.totalValue, 0);
  const totalConsumptionValue = filteredConsumption.reduce((sum, c) => sum + c.totalValue, 0);
  const totalCurrentValue = inventoryReports.reduce((sum, r) => sum + r.currentValue, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground">Comprehensive inventory reports and analytics</p>
      </div>

      {/* Date Filter */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Date Range Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={dateFilter.startDate}
                onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={dateFilter.endDate}
                onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
            <Button 
              onClick={() => setDateFilter({ startDate: "", endDate: "" })}
              variant="outline"
            >
              Clear Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Receipts</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{formatCurrency(totalReceiptValue)}</div>
            <p className="text-xs text-muted-foreground">{filteredReceipts.length} transactions</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Consumption</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatCurrency(totalConsumptionValue)}</div>
            <p className="text-xs text-muted-foreground">{filteredConsumption.length} transactions</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Value</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatCurrency(totalCurrentValue)}</div>
            <p className="text-xs text-muted-foreground">Total inventory value</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports Tabs */}
      <Tabs defaultValue="receipts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="receipts">Stock Receipts</TabsTrigger>
          <TabsTrigger value="consumption">Stock Consumption</TabsTrigger>
          <TabsTrigger value="valuation">Stock Valuation</TabsTrigger>
        </TabsList>

        {/* Stock Receipts Report */}
        <TabsContent value="receipts">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-accent" />
                  <span>Stock Receipt Report</span>
                </CardTitle>
                <Button onClick={exportReceiptReport} className="bg-gradient-accent hover:bg-accent-hover">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 font-medium text-foreground">ID</th>
                      <th className="text-left p-3 font-medium text-foreground">Item</th>
                      <th className="text-left p-3 font-medium text-foreground">Quantity</th>
                      <th className="text-left p-3 font-medium text-foreground">Rate</th>
                      <th className="text-left p-3 font-medium text-foreground">Total Value</th>
                      <th className="text-left p-3 font-medium text-foreground">Supplier</th>
                      <th className="text-left p-3 font-medium text-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReceipts.map((receipt) => (
                      <tr key={receipt.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-3">
                          <Badge variant="secondary">{receipt.id}</Badge>
                        </td>
                        <td className="p-3">
                          <div>
                            <p className="font-medium text-foreground">{receipt.itemName}</p>
                            <p className="text-sm text-muted-foreground">{receipt.itemCode}</p>
                          </div>
                        </td>
                        <td className="p-3 text-foreground">{receipt.quantityReceived} {receipt.unitOfMeasurement}</td>
                        <td className="p-3 text-foreground">{formatCurrency(receipt.ratePerUnit)}</td>
                        <td className="p-3 font-bold text-accent">{formatCurrency(receipt.totalValue)}</td>
                        <td className="p-3 text-foreground">{receipt.supplierName}</td>
                        <td className="p-3 text-foreground">{formatDate(receipt.deliveryDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stock Consumption Report */}
        <TabsContent value="consumption">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-destructive" />
                  <span>Stock Consumption Report</span>
                </CardTitle>
                <Button onClick={exportConsumptionReport} className="bg-gradient-primary hover:bg-primary-hover">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 font-medium text-foreground">ID</th>
                      <th className="text-left p-3 font-medium text-foreground">Item</th>
                      <th className="text-left p-3 font-medium text-foreground">Quantity</th>
                      <th className="text-left p-3 font-medium text-foreground">Value</th>
                      <th className="text-left p-3 font-medium text-foreground">Activity</th>
                      <th className="text-left p-3 font-medium text-foreground">Used By</th>
                      <th className="text-left p-3 font-medium text-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredConsumption.map((consumption) => (
                      <tr key={consumption.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-3">
                          <Badge variant="outline">{consumption.id}</Badge>
                        </td>
                        <td className="p-3">
                          <div>
                            <p className="font-medium text-foreground">{consumption.itemName}</p>
                            <p className="text-sm text-muted-foreground">{consumption.itemCode}</p>
                          </div>
                        </td>
                        <td className="p-3 text-foreground">{consumption.quantityUsed} {consumption.unitOfMeasurement}</td>
                        <td className="p-3 font-bold text-destructive">{formatCurrency(consumption.totalValue)}</td>
                        <td className="p-3">
                          <Badge variant="secondary">{consumption.purposeActivityCode}</Badge>
                        </td>
                        <td className="p-3 text-foreground">{consumption.usedBy}</td>
                        <td className="p-3 text-foreground">{formatDate(consumption.date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stock Valuation Report */}
        <TabsContent value="valuation">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-success" />
                  <span>Stock Valuation Report</span>
                </CardTitle>
                <Button onClick={exportValuationReport} className="bg-gradient-primary hover:bg-primary-hover">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 font-medium text-foreground">Item</th>
                      <th className="text-left p-3 font-medium text-foreground">Code</th>
                      <th className="text-left p-3 font-medium text-foreground">Total Received</th>
                      <th className="text-left p-3 font-medium text-foreground">Total Consumed</th>
                      <th className="text-left p-3 font-medium text-foreground">Current Stock</th>
                      <th className="text-left p-3 font-medium text-foreground">Current Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryReports.map((report) => (
                      <tr key={report.itemCode} className="border-b border-border hover:bg-muted/50">
                        <td className="p-3 font-medium text-foreground">{report.itemName}</td>
                        <td className="p-3">
                          <Badge variant="secondary">{report.itemCode}</Badge>
                        </td>
                        <td className="p-3 text-accent font-medium">{report.totalReceived} {report.unitOfMeasurement}</td>
                        <td className="p-3 text-destructive font-medium">{report.totalConsumed} {report.unitOfMeasurement}</td>
                        <td className="p-3 text-foreground font-medium">{report.currentStock} {report.unitOfMeasurement}</td>
                        <td className="p-3 font-bold text-success">{formatCurrency(report.currentValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;