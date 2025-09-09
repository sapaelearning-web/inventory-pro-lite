import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInventoryStore } from "@/hooks/useInventoryStore";
import { Package, TrendingUp, TrendingDown, DollarSign, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const { stockItems, stockReceipts, stockConsumption, getInventoryReports } = useInventoryStore();
  
  const reports = getInventoryReports();
  const totalValue = reports.reduce((sum, item) => sum + item.currentValue, 0);
  const lowStockItems = stockItems.filter(item => item.currentQuantity < 50);
  
  const recentReceipts = stockReceipts.slice(0, 5);
  const recentConsumption = stockConsumption.slice(0, 5);

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
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your construction site inventory</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stockItems.length}</div>
            <p className="text-xs text-muted-foreground">Active inventory items</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground">Current inventory value</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Receipts</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stockReceipts.length}</div>
            <p className="text-xs text-muted-foreground">Total stock receipts</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alert</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">Items below threshold</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Stock Receipts */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              <span>Recent Stock Receipts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReceipts.map((receipt) => (
                <div key={receipt.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{receipt.itemName}</p>
                    <p className="text-sm text-muted-foreground">
                      {receipt.quantityReceived} {receipt.unitOfMeasurement} • {receipt.supplierName}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(receipt.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-accent">{formatCurrency(receipt.totalValue)}</p>
                    <Badge variant="secondary" className="text-xs">{receipt.itemCode}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Stock Consumption */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingDown className="h-5 w-5 text-destructive" />
              <span>Recent Stock Consumption</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentConsumption.map((consumption) => (
                <div key={consumption.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{consumption.itemName}</p>
                    <p className="text-sm text-muted-foreground">
                      {consumption.quantityUsed} {consumption.unitOfMeasurement} • {consumption.usedBy}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(consumption.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-destructive">{formatCurrency(consumption.totalValue)}</p>
                    <Badge variant="outline" className="text-xs">{consumption.purposeActivityCode}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Stock Overview */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-primary" />
            <span>Current Stock Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stockItems.map((item) => (
              <div key={item.id} className="p-4 bg-gradient-surface rounded-lg border border-border">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-foreground">{item.itemName}</h3>
                  <Badge variant={item.currentQuantity < 50 ? "destructive" : "secondary"}>
                    {item.itemCode}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Quantity: <span className="font-medium text-foreground">{item.currentQuantity} {item.unitOfMeasurement}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Rate: <span className="font-medium text-foreground">{formatCurrency(item.rate)} per {item.unitOfMeasurement}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total Value: <span className="font-bold text-success">{formatCurrency(item.currentQuantity * item.rate)}</span>
                  </p>
                </div>
                {item.currentQuantity < 50 && (
                  <div className="mt-2 flex items-center text-warning">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    <span className="text-xs">Low Stock Alert</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;