CREATE TABLE public.admin_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'Uncategorized',
  mrp NUMERIC NOT NULL DEFAULT 0,
  price NUMERIC NOT NULL DEFAULT 0,
  images TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.admin_products TO anon;
GRANT SELECT ON public.admin_products TO authenticated;
GRANT ALL ON public.admin_products TO service_role;

ALTER TABLE public.admin_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view admin products"
  ON public.admin_products FOR SELECT
  USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_admin_products_updated_at
  BEFORE UPDATE ON public.admin_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();