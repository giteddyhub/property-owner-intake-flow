
-- Create table for contact information
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key columns to existing tables to reference the contact
ALTER TABLE public.owners
ADD COLUMN contact_id UUID REFERENCES public.contacts(id);

ALTER TABLE public.properties
ADD COLUMN contact_id UUID REFERENCES public.contacts(id);

ALTER TABLE public.owner_property_assignments
ADD COLUMN contact_id UUID REFERENCES public.contacts(id);

-- Enable RLS for contacts table
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert to contacts
CREATE POLICY "Anyone can insert contacts" ON public.contacts
FOR INSERT TO anon
WITH CHECK (true);

-- Create policy to allow select for contacts table
CREATE POLICY "Anyone can select contacts" ON public.contacts
FOR SELECT TO anon
USING (true);
