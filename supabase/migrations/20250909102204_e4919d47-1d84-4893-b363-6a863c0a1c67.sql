-- Create tables for inventory management system

-- Stock items table (master data)
CREATE TABLE public.stock_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_name TEXT NOT NULL,
  item_code TEXT NOT NULL UNIQUE,
  current_quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit_of_measurement TEXT NOT NULL,
  rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Stock receipts table (incoming stock)
CREATE TABLE public.stock_receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_name TEXT NOT NULL,
  item_code TEXT NOT NULL,
  quantity_received DECIMAL(10,2) NOT NULL,
  rate_per_unit DECIMAL(10,2) NOT NULL,
  unit_of_measurement TEXT NOT NULL,
  total_value DECIMAL(10,2) NOT NULL,
  supplier_name TEXT NOT NULL,
  delivery_date DATE NOT NULL,
  received_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by TEXT NOT NULL,
  edited_at TIMESTAMP WITH TIME ZONE,
  edited_by TEXT,
  FOREIGN KEY (item_code) REFERENCES public.stock_items(item_code) ON UPDATE CASCADE
);

-- Stock consumption table (outgoing stock)
CREATE TABLE public.stock_consumption (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_name TEXT NOT NULL,
  item_code TEXT NOT NULL,
  quantity_used DECIMAL(10,2) NOT NULL,
  purpose_activity_code TEXT NOT NULL,
  used_by TEXT NOT NULL,
  date DATE NOT NULL,
  remarks TEXT,
  unit_of_measurement TEXT NOT NULL,
  rate_per_unit DECIMAL(10,2) NOT NULL,
  total_value DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by TEXT NOT NULL,
  edited_at TIMESTAMP WITH TIME ZONE,
  edited_by TEXT,
  FOREIGN KEY (item_code) REFERENCES public.stock_items(item_code) ON UPDATE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_consumption ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since no authentication is implemented yet)
CREATE POLICY "Allow all access to stock_items" ON public.stock_items FOR ALL TO anon, authenticated USING (true);
CREATE POLICY "Allow all access to stock_receipts" ON public.stock_receipts FOR ALL TO anon, authenticated USING (true);
CREATE POLICY "Allow all access to stock_consumption" ON public.stock_consumption FOR ALL TO anon, authenticated USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for stock_items updated_at
CREATE TRIGGER update_stock_items_updated_at
  BEFORE UPDATE ON public.stock_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update stock quantities automatically
CREATE OR REPLACE FUNCTION public.update_stock_on_receipt()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert stock item
  INSERT INTO public.stock_items (item_name, item_code, current_quantity, unit_of_measurement, rate)
  VALUES (NEW.item_name, NEW.item_code, NEW.quantity_received, NEW.unit_of_measurement, NEW.rate_per_unit)
  ON CONFLICT (item_code) 
  DO UPDATE SET 
    current_quantity = stock_items.current_quantity + NEW.quantity_received,
    rate = NEW.rate_per_unit,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Function to update stock quantities on consumption
CREATE OR REPLACE FUNCTION public.update_stock_on_consumption()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if sufficient stock exists
  IF NOT EXISTS (
    SELECT 1 FROM public.stock_items 
    WHERE item_code = NEW.item_code 
    AND current_quantity >= NEW.quantity_used
  ) THEN
    RAISE EXCEPTION 'Insufficient stock available for item %', NEW.item_code;
  END IF;

  -- Update stock quantity
  UPDATE public.stock_items 
  SET 
    current_quantity = current_quantity - NEW.quantity_used,
    updated_at = now()
  WHERE item_code = NEW.item_code;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for automatic stock updates
CREATE TRIGGER update_stock_on_receipt_trigger
  AFTER INSERT ON public.stock_receipts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_stock_on_receipt();

CREATE TRIGGER update_stock_on_consumption_trigger
  AFTER INSERT ON public.stock_consumption
  FOR EACH ROW
  EXECUTE FUNCTION public.update_stock_on_consumption();

-- Insert sample data
INSERT INTO public.stock_items (item_name, item_code, current_quantity, unit_of_measurement, rate) VALUES
('Portland Cement', 'CEM001', 50.00, 'Bags', 450.00),
('Steel Rebar 12mm', 'REB012', 25.00, 'Pieces', 850.00),
('Concrete Blocks', 'BLK001', 200.00, 'Pieces', 25.00),
('Sand', 'SND001', 10.00, 'Cubic Meters', 1200.00),
('Gravel', 'GRV001', 8.00, 'Cubic Meters', 1500.00),
('Paint (White)', 'PNT001', 15.00, 'Liters', 180.00),
('PVC Pipes 4 inch', 'PVC004', 30.00, 'Pieces', 120.00),
('Electrical Wire 2.5mm', 'WIR025', 100.00, 'Meters', 45.00);

INSERT INTO public.stock_receipts (item_name, item_code, quantity_received, rate_per_unit, unit_of_measurement, total_value, supplier_name, delivery_date, received_by, created_by) VALUES
('Portland Cement', 'CEM001', 20.00, 450.00, 'Bags', 9000.00, 'ABC Suppliers', '2024-01-15', 'John Smith', 'Site Supervisor'),
('Steel Rebar 12mm', 'REB012', 10.00, 850.00, 'Pieces', 8500.00, 'Steel Works Ltd', '2024-01-16', 'Mike Johnson', 'Site Supervisor'),
('Concrete Blocks', 'BLK001', 100.00, 25.00, 'Pieces', 2500.00, 'Block Manufacturers', '2024-01-17', 'Sarah Wilson', 'Material Handler');

INSERT INTO public.stock_consumption (item_name, item_code, quantity_used, purpose_activity_code, used_by, date, remarks, unit_of_measurement, rate_per_unit, total_value, created_by) VALUES
('Portland Cement', 'CEM001', 5.00, 'FOUND001', 'Construction Team A', '2024-01-18', 'Foundation work for Building A', 'Bags', 450.00, 2250.00, 'Site Supervisor'),
('Steel Rebar 12mm', 'REB012', 3.00, 'FOUND001', 'Construction Team A', '2024-01-18', 'Reinforcement for foundation', 'Pieces', 850.00, 2550.00, 'Site Supervisor'),
('Concrete Blocks', 'BLK001', 50.00, 'WALL001', 'Construction Team B', '2024-01-19', 'Wall construction - Ground floor', 'Pieces', 25.00, 1250.00, 'Site Supervisor');