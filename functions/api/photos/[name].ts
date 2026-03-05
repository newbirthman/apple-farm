export async function onRequestGet(context: any) {
    const { env, params } = context;
    const name = params.name;

    if (!name) {
        return new Response('Not found', { status: 404 });
    }

    if (!env.apple_farm_photos) {
        return new Response('R2 bucket not bound', { status: 500 });
    }

    const object = await env.apple_farm_photos.get(name);

    if (object === null) {
        return new Response('Not found', { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    return new Response(object.body, {
        headers,
    });
}
