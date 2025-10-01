-- Create storage bucket for invoice documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('invoice-documents', 'invoice-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for invoice-documents bucket
CREATE POLICY "Authenticated users can upload invoice documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'invoice-documents');

CREATE POLICY "Users can view their own invoice documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'invoice-documents');

CREATE POLICY "Admins and managers can view all invoice documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'invoice-documents' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role IN ('admin', 'manager')
  )
);

CREATE POLICY "Users can delete their own invoice documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'invoice-documents');

-- Add invoice tracking columns to project_materials table
ALTER TABLE project_materials
ADD COLUMN IF NOT EXISTS invoice_document_url TEXT,
ADD COLUMN IF NOT EXISTS supplier_name TEXT,
ADD COLUMN IF NOT EXISTS invoice_date DATE;