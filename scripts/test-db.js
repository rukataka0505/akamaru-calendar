require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

async function testSupabase() {
    console.log("Testing Supabase Connection...");

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
        console.error("❌ NEXT_PUBLIC_SUPABASE_URL is missing");
        return;
    }
    if (!supabaseServiceKey) {
        console.error("❌ SUPABASE_SERVICE_ROLE_KEY is missing");
        return;
    }

    console.log(`URL: ${supabaseUrl}`);
    console.log(`Key: ${supabaseServiceKey.substring(0, 10)}... (Length: ${supabaseServiceKey.length})`);

    try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            },
        });

        // Try a simple query
        const { data, error } = await supabase.from('events').select('count', { count: 'exact', head: true });

        if (error) {
            console.error("❌ Supabase Query Error:", error);
        } else {
            console.log("✅ Supabase Connection Successful!");
            console.log("Event count:", data); // data might be null with head: true, count is in count property usually but check structure
        }

    } catch (e) {
        console.error("❌ Unexpected Error in script:", e);
    }
}

testSupabase();
