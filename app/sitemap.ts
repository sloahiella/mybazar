import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://jthdtmqrapnfmmmeuqsw.supabase.co',
  'sb_publishable_Eoh22VBAPMLBFnhyXMkq6Q_LqIbOw6J'
);

export default async function sitemap() {
  const { data: products } = await supabase.from('products').select('id, updated_at').eq('is_active', true);
  const { data: pages } = await supabase.from('pages').select('id, updated_at').eq('is_active', true);

  const productUrls = (products || []).map((product: any) => ({
    url: `https://sohelmart.com?product=${product.id}`,
    lastModified: product.updated_at || new Date(),
  }));

  const pageUrls = (pages || []).map((page: any) => ({
    url: `https://sohelmart.com?page=${page.id}`,
    lastModified: page.updated_at || new Date(),
  }));

  return [
    {
      url: 'https://sohelmart.com',
      lastModified: new Date(),
    },
    ...pageUrls,
    ...productUrls,
  ];
}