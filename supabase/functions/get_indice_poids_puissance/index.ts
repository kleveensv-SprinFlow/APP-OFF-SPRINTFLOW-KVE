import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const profile = await supabase
      .from("profiles")
      .select("taille_cm")
      .eq("id", user.id)
      .maybeSingle();

    const latestCorpo = await supabase
      .from("donnees_corporelles")
      .select("poids_kg, masse_grasse_pct")
      .eq("athlete_id", user.id)
      .order("date", { ascending: false })
      .limit(1)
      .maybeSingle();

    const records = await supabase
      .from("records")
      .select("exercice_id, value")
      .eq("user_id", user.id)
      .not("exercice_id", "is", null);

    const exercices = await supabase
      .from("exercices_reference")
      .select("*");

    let scoreCompo = 50;
    const poids = latestCorpo?.data?.poids_kg || 70;
    const taille = (profile?.data?.taille_cm || 180) / 100;
    const masseGrasse = latestCorpo?.data?.masse_grasse_pct;

    if (masseGrasse) {
      if (masseGrasse <= 10) scoreCompo = 100;
      else if (masseGrasse <= 12) scoreCompo = 95;
      else if (masseGrasse <= 14) scoreCompo = 85;
      else if (masseGrasse <= 16) scoreCompo = 75;
      else if (masseGrasse <= 18) scoreCompo = 65;
      else if (masseGrasse <= 20) scoreCompo = 50;
      else scoreCompo = Math.max(30, 50 - (masseGrasse - 20) * 2);
    } else {
      const imc = poids / (taille * taille);
      if (imc < 20) scoreCompo = 80;
      else if (imc < 22) scoreCompo = 90;
      else if (imc < 24) scoreCompo = 75;
      else if (imc < 26) scoreCompo = 60;
      else scoreCompo = Math.max(30, 60 - (imc - 26) * 5);
    }

    const categorieScores: Record<string, number> = {};
    const exMap = new Map(exercices?.data?.map(e => [e.id, e]) || []);

    for (const rec of records?.data || []) {
      const ex = exMap.get(rec.exercice_id);
      if (!ex) continue;

      const ratio = rec.value / poids;
      let score = 0;

      if (ratio >= ex.bareme_elite) score = 100;
      else if (ratio >= ex.bareme_avance) {
        const range = ex.bareme_elite - ex.bareme_avance;
        score = 80 + ((ratio - ex.bareme_avance) / range) * 20;
      } else if (ratio >= ex.bareme_intermediaire) {
        const range = ex.bareme_avance - ex.bareme_intermediaire;
        score = 60 + ((ratio - ex.bareme_intermediaire) / range) * 20;
      } else {
        score = Math.min((ratio / ex.bareme_intermediaire) * 60, 59);
      }

      if (!categorieScores[ex.categorie] || score > categorieScores[ex.categorie]) {
        categorieScores[ex.categorie] = score;
      }
    }

    const weights = {
      halterophilie: 0.35,
      muscu_bas: 0.35,
      muscu_haut: 0.20,
      unilateral: 0.10,
    };

    let scoreForce = 0;
    let totalWeight = 0;

    for (const [cat, weight] of Object.entries(weights)) {
      if (categorieScores[cat]) {
        scoreForce += categorieScores[cat] * weight;
        totalWeight += weight;
      }
    }

    if (totalWeight > 0) {
      scoreForce = scoreForce / totalWeight;
    } else {
      scoreForce = 0;
    }

    const indice = Math.round(scoreCompo * 0.4 + scoreForce * 0.6);

    return new Response(
      JSON.stringify({
        indice,
        scoreCompo: Math.round(scoreCompo),
        scoreForce: Math.round(scoreForce),
        categorieScores,
        details: { poids, taille: taille * 100, masseGrasse },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});