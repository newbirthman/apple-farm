export async function onRequestPost(context: any) {
    const { request, env } = context;
    try {
        const formData = await request.formData();
        const file = formData.get('photo');

        if (!file || !(file instanceof File)) {
            return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400 });
        }

        const fileObj = file as File;
        const ext = fileObj.name.split('.').pop() || 'png';
        const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;

        if (!env.apple_farm_photos) {
            return new Response(JSON.stringify({ error: 'R2 bucket not bound. env.apple_farm_photos is missing.' }), { status: 500 });
        }

        await env.apple_farm_photos.put(filename, fileObj.stream(), {
            httpMetadata: { contentType: fileObj.type }
        });

        return new Response(JSON.stringify({ url: `/api/photos/${filename}` }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
