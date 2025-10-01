import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData, projectId } = await req.json();
    
    if (!imageData) {
      return new Response(
        JSON.stringify({ error: 'Image data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Extracting materials from invoice image...');

    // Call Lovable AI with Gemini Vision to extract materials
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert at extracting material information from construction invoices and supplier documents.

CRITICAL INSTRUCTIONS:
1. Extract EVERY individual line item visible in the materials/products list - including materials, delivery fees, deposits, memo items, and any other charges
2. DO NOT extract summary totals (subtotals, VAT totals, grand totals at the bottom)
3. Calculate totalPrice for each item as: quantity × unitPrice (or just use the price if no quantity)
4. Extract ALL line items - let the user decide what to include later

Extract each line item with:
- Material name (full product name)
- Description (additional details, specifications)
- Quantity (numeric value from the invoice)
- Unit (pieces, m², kg, rolls, etc.)
- Unit price (price per unit before quantity)
- Total price (quantity × unit price) - CALCULATE THIS, don't extract from totals section
- Category (classify as: Concrete, Steel, Lumber, Electrical, Plumbing, Roofing, Insulation, Interior, Hardware, Tools, or General)
- Supplier name (from invoice header)
- Invoice date (if visible)

Return ONLY a valid JSON object with this exact structure:
{
  "supplier": "Supplier Name",
  "invoiceDate": "YYYY-MM-DD",
  "materials": [
    {
      "name": "Material name",
      "description": "Additional details",
      "quantity": 10,
      "unit": "pieces",
      "unitPrice": 15.50,
      "totalPrice": 155.00,
      "category": "Hardware",
      "confidence": 0.95
    }
  ]
}

IMPORTANT:
- Extract EVERY line item from the invoice, including delivery fees, deposits (statiegeld), memo items, and any other charges
- Only skip summary lines like "Totaal excl. BTW", "BTW", "Totaal incl. BTW" at the bottom
- For each item, totalPrice should equal quantity × unitPrice (or just the price if no quantity specified)
- Use confidence score (0-1) to indicate certainty about the extraction
- Handle Dutch, English, and other languages
- Parse formatted numbers correctly (comma/period separators)
- Include unclear or ambiguous items with lower confidence scores rather than skipping them`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract all materials from this invoice image. Be thorough and extract every line item.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageData
                }
              }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 4000
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI API error: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const extractedText = aiData.choices?.[0]?.message?.content;

    if (!extractedText) {
      throw new Error('No content in AI response');
    }

    console.log('AI raw response:', extractedText);

    // Parse the JSON response
    let extractedData;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = extractedText.match(/```json\n?([\s\S]*?)\n?```/) || 
                       extractedText.match(/```\n?([\s\S]*?)\n?```/);
      const jsonText = jsonMatch ? jsonMatch[1] : extractedText;
      extractedData = JSON.parse(jsonText.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse extracted data. Please try again with a clearer image.',
          rawResponse: extractedText 
        }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate and normalize the extracted data
    if (!extractedData.materials || !Array.isArray(extractedData.materials)) {
      throw new Error('Invalid extraction format: missing materials array');
    }

    // Normalize materials
    const normalizedMaterials = extractedData.materials.map((material: any) => ({
      name: material.name || 'Unknown Material',
      description: material.description || '',
      quantity: parseFloat(material.quantity) || 0,
      unit: material.unit || 'pieces',
      unitPrice: parseFloat(material.unitPrice) || 0,
      totalPrice: parseFloat(material.totalPrice) || (parseFloat(material.quantity) || 0) * (parseFloat(material.unitPrice) || 0),
      category: material.category || 'General',
      confidence: parseFloat(material.confidence) || 0.5
    }));

    const result = {
      supplier: extractedData.supplier || 'Unknown Supplier',
      invoiceDate: extractedData.invoiceDate || null,
      materials: normalizedMaterials,
      totalMaterials: normalizedMaterials.length,
      totalValue: normalizedMaterials.reduce((sum: number, m: any) => sum + m.totalPrice, 0)
    };

    console.log(`Successfully extracted ${result.totalMaterials} materials from invoice`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in extract_materials function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});