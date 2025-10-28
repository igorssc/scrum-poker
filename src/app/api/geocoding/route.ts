import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json(
      { error: 'Parâmetros lat e lng são obrigatórios' },
      { status: 400 }
    );
  }

  // Valida se são números válidos
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (isNaN(latitude) || isNaN(longitude)) {
    return NextResponse.json(
      { error: 'Coordenadas inválidas' },
      { status: 400 }
    );
  }

  // Verifica se a chave do Google existe
  const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!googleApiKey) {
    return NextResponse.json(
      { error: 'Chave do Google Maps não configurada' },
      { status: 500 }
    );
  }

  try {
    const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleApiKey}&language=pt-BR&result_type=street_address|route|neighborhood|political`;
    
    const response = await fetch(googleUrl);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Google API error: ${response.status}`);
    }

    // Retorna a resposta completa do Google para o client processar
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro na API de geocoding:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}