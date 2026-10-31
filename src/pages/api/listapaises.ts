import type { APIRoute } from 'astro';
import listaPaises from '../../data/lista_paises.json';

function getFlagEmoji(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return '';
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

export const GET: APIRoute = async () => {
  try {
    //const response = await fetch('https://countries.dev/countries?fields=name,flag,translations');
    //const data = await response.json();
    //const countriesList = Array.isArray(data) ? data : data.countries || [];

    const countriesList = listaPaises;

    const formattedPaises = countriesList.map((country: any) => {
      const nomePt = country.translations?.pt?.common || country.translations?.pt || country.name;

      const rawFlag = country.flag || '';
      const flagEmoji = rawFlag.length === 2 ? getFlagEmoji(rawFlag) : rawFlag;

      return {
        label: nomePt,
        value: nomePt,
        icon: flagEmoji,
      };
    });

    formattedPaises.sort((a: { label: string }, b: { label: string }) =>
      a.label.localeCompare(b.label, 'pt', { sensitivity: 'base' }),
    );

    return new Response(JSON.stringify(formattedPaises), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Erro ao processar países:', error);
    return new Response(JSON.stringify({ error: 'Erro ao carregar países' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
