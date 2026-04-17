import { redirect } from '@sveltejs/kit';

export function load({ params }) {
    const realm = encodeURIComponent(params.realm);
    const name = encodeURIComponent(params.name);
    const tab = encodeURIComponent(params.tab);

    throw redirect(307, `/wow?char=${realm}/${name}/${tab}`);
}