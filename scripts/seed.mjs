import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
  console.log("Seeding Supabase Database...");

  try {
    // 1. Leer index.json
    const indexPath = path.resolve('src/data/index.json');
    const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));

    // Insertar Semanas Metadata
    console.log("Inserting weeks_meta...");
    for (const week of indexData.weeks) {
      const { error } = await supabase
        .from('weeks_meta')
        .upsert({
          week_id: week.week,
          title: week.title,
          description: week.description,
          day_start: week.dayRange[0],
          day_end: week.dayRange[1]
        });
      
      if (error) console.error("Error inserting week_meta:", error.message);
    }

    // 2. Leer week-XX.json (por ahora week-01.json)
    console.log("Inserting reading_days for Week 1...");
    const week01Path = path.resolve('src/data/weeks/week-01.json');
    if (fs.existsSync(week01Path)) {
      const week01Data = JSON.parse(fs.readFileSync(week01Path, 'utf-8'));
      
      for (const d of week01Data.days) {
        // Enpaquetamos en content la info pesada
        const contentJson = {
          central: d.central,
          parallels: d.parallels,
          parallelNote: d.parallelNote,
          egw: d.egw
        };

        const { error } = await supabase
          .from('reading_days')
          .upsert({
            global_day: d.globalDay,
            week_id: week01Data.week,
            day_in_week: d.day,
            title: d.title,
            subtitle: d.subtitle,
            estimated_minutes: d.estimatedMinutes,
            content: contentJson
          });

        if (error) console.error(`Error inserting reading_day ${d.globalDay}:`, error.message);
      }
    }

    console.log("Seeding completed successfully!");
  } catch (err) {
    console.error("Seeding failed:", err);
  }
}

seed();
