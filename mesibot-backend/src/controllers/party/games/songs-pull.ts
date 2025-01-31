import { writeFileSync } from "fs";
import { OPENAI_API_KEY } from "../../../env";
import { guessTheSongPrompt } from "./prompts/guessTheSongPropmt";
import enrichedSongs, { SongLyrics } from "./enrichedSongs";

interface SongInfo {
  year: number;
  songName: string;
  artist: string;
}

function mergeYearIntoSongs(songsWithYear: SongInfo[], songsWithLyrics: SongLyrics[]): SongLyrics[] {
  return songsWithLyrics.map((song) => {
    const matchingSong = songsWithYear.find((s) => s.songName === song.songName && s.artist === song.artist);

    return matchingSong ? { ...song, year: matchingSong.year } : song;
  });
}

const songsInfo: SongInfo[] = [
  {
    songName: "So What",
    artist: "Pink",
    year: 2008
  },
  {
    songName: "You Oughta Know",
    artist: "Alanis Morissette",
    year: 1995
  },
  { year: 2000, songName: "Breathe", artist: "Faith Hill" },
  { year: 2000, songName: "Smooth", artist: "Santana featuring Rob Thomas" },
  { year: 2000, songName: "Maria Maria", artist: "Santana featuring The Product G&B" },
  { year: 2000, songName: "I Wanna Know", artist: "Joe" },

  { year: 2001, songName: "Hanging by a Moment", artist: "Lifehouse" },
  { year: 2001, songName: "Fallin'", artist: "Alicia Keys" },
  { year: 2001, songName: "All for You", artist: "Janet Jackson" },
  { year: 2001, songName: "Drops of Jupiter", artist: "Train" },

  { year: 2002, songName: "How You Remind Me", artist: "Nickelback" },
  { year: 2002, songName: "Foolish", artist: "Ashanti" },
  { year: 2002, songName: "Hot in Herre", artist: "Nelly" },
  { year: 2002, songName: "A Thousand Miles", artist: "Vanessa Carlton" },

  { year: 2003, songName: "In da Club", artist: "50 Cent" },
  { year: 2003, songName: "Ignition (Remix)", artist: "R. Kelly" },
  { year: 2003, songName: "Get Busy", artist: "Sean Paul" },
  { year: 2003, songName: "Crazy in Love", artist: "Beyoncé featuring Jay-Z" },

  { year: 2004, songName: "Yeah!", artist: "Usher featuring Lil Jon and Ludacris" },
  { year: 2004, songName: "Burn", artist: "Usher" },
  { year: 2004, songName: "If I Ain't Got You", artist: "Alicia Keys" },
  { year: 2004, songName: "This Love", artist: "Maroon 5" },

  { year: 2005, songName: "We Belong Together", artist: "Mariah Carey" },
  { year: 2005, songName: "Hollaback Girl", artist: "Gwen Stefani" },
  { year: 2005, songName: "Let Me Love You", artist: "Mario" },
  { year: 2005, songName: "Since U Been Gone", artist: "Kelly Clarkson" },

  { year: 2006, songName: "Bad Day", artist: "Daniel Powter" },
  { year: 2006, songName: "Temperature", artist: "Sean Paul" },
  { year: 2006, songName: "Promiscuous", artist: "Nelly Furtado featuring Timbaland" },
  { year: 2006, songName: "You're Beautiful", artist: "James Blunt" },

  { year: 2007, songName: "Irreplaceable", artist: "Beyoncé" },
  { year: 2007, songName: "Umbrella", artist: "Rihanna featuring Jay-Z" },
  { year: 2007, songName: "Glamorous", artist: "Fergie featuring Ludacris" },
  { year: 2007, songName: "Big Girls Don't Cry", artist: "Fergie" },

  { year: 2008, songName: "Low", artist: "Flo Rida featuring T-Pain" },
  { year: 2008, songName: "Bleeding Love", artist: "Leona Lewis" },
  { year: 2008, songName: "No One", artist: "Alicia Keys" },
  { year: 2008, songName: "Lollipop", artist: "Lil Wayne featuring Static Major" },

  { year: 2009, songName: "Boom Boom Pow", artist: "The Black Eyed Peas" },
  { year: 2009, songName: "Poker Face", artist: "Lady Gaga" },
  { year: 2009, songName: "Just Dance", artist: "Lady Gaga featuring Colby O'Donis" },
  { year: 2009, songName: "I Gotta Feeling", artist: "The Black Eyed Peas" },

  { year: 2010, songName: "Tik Tok", artist: "Kesha" },
  { year: 2010, songName: "Need You Now", artist: "Lady Antebellum" },
  { year: 2010, songName: "Hey, Soul Sister", artist: "Train" },
  { year: 2010, songName: "California Gurls", artist: "Katy Perry featuring Snoop Dogg" },

  { year: 2011, songName: "Rolling in the Deep", artist: "Adele" },
  { year: 2011, songName: "Party Rock Anthem", artist: "LMFAO featuring Lauren Bennett and GoonRock" },
  { year: 2011, songName: "Firework", artist: "Katy Perry" },
  { year: 2011, songName: "E.T.", artist: "Katy Perry featuring Kanye West" },

  { year: 2012, songName: "Somebody That I Used to Know", artist: "Gotye featuring Kimbra" },
  { year: 2012, songName: "Call Me Maybe", artist: "Carly Rae Jepsen" },
  { year: 2012, songName: "We Are Young", artist: "Fun featuring Janelle Monáe" },
  { year: 2012, songName: "Payphone", artist: "Maroon 5 featuring Wiz Khalifa" },

  { year: 2013, songName: "Thrift Shop", artist: "Macklemore & Ryan Lewis featuring Wanz" },
  { year: 2013, songName: "Blurred Lines", artist: "Robin Thicke featuring T.I. and Pharrell" },
  { year: 2013, songName: "Radioactive", artist: "Imagine Dragons" },
  { year: 2013, songName: "Harlem Shake", artist: "Baauer" },

  { year: 2014, songName: "Happy", artist: "Pharrell Williams" },
  { year: 2014, songName: "Dark Horse", artist: "Katy Perry featuring Juicy J" },
  { year: 2014, songName: "All of Me", artist: "John Legend" },
  { year: 2014, songName: "Fancy", artist: "Iggy Azalea featuring Charli XCX" },

  { year: 2015, songName: "Uptown Funk", artist: "Mark Ronson featuring Bruno Mars" },
  { year: 2015, songName: "Thinking Out Loud", artist: "Ed Sheeran" },
  { year: 2015, songName: "See You Again", artist: "Wiz Khalifa featuring Charlie Puth" },
  { year: 2015, songName: "Trap Queen", artist: "Fetty Wap" },

  { year: 2016, songName: "Love Yourself", artist: "Justin Bieber" },
  { year: 2016, songName: "Sorry", artist: "Justin Bieber" },
  { year: 2016, songName: "One Dance", artist: "Drake featuring Wizkid and Kyla" },
  { year: 2016, songName: "Work", artist: "Rihanna featuring Drake" },

  { year: 2017, songName: "Shape of You", artist: "Ed Sheeran" },
  { year: 2017, songName: "Despacito", artist: "Luis Fonsi and Daddy Yankee featuring Justin Bieber" },
  { year: 2017, songName: "That's What I Like", artist: "Bruno Mars" },
  { year: 2017, songName: "Humble", artist: "Kendrick Lamar" },
  { year: 2017, songName: "Cold", artist: "Maroon 5" },

  { year: 2018, songName: "God's Plan", artist: "Drake" },
  { year: 2018, songName: "Perfect", artist: "Ed Sheeran" },
  { year: 2018, songName: "Meant to Be", artist: "Bebe Rexha and Florida Georgia Line" },
  { year: 2018, songName: "Havana", artist: "Camila Cabello featuring Young Thug" },

  { year: 2019, songName: "Old Town Road", artist: "Lil Nas X featuring Billy Ray Cyrus" },
  { year: 2019, songName: "Sunflower", artist: "Post Malone and Swae Lee" },
  { year: 2019, songName: "Without Me", artist: "Halsey" },
  { year: 2019, songName: "Bad Guy", artist: "Billie Eilish" },

  { year: 2020, songName: "Blinding Lights", artist: "The Weeknd" },
  { year: 2020, songName: "Circles", artist: "Post Malone" },
  { year: 2020, songName: "The Box", artist: "Roddy Ricch" },
  { year: 2020, songName: "Don't Start Now", artist: "Dua Lipa" },

  { year: 2021, songName: "Levitating", artist: "Dua Lipa" },
  { year: 2021, songName: "Save Your Tears", artist: "The Weeknd and Ariana Grande" },
  { year: 2021, songName: "Blinding Lights", artist: "The Weeknd" },
  { year: 2021, songName: "Mood", artist: "24kGoldn featuring Iann Dior" },

  { year: 2022, songName: "Heat Waves", artist: "Glass Animals" },
  { year: 2022, songName: "As It Was", artist: "Harry Styles" },
  { year: 2022, songName: "Stay", artist: "The Kid Laroi and Justin Bieber" },
  { year: 2022, songName: "Easy on Me", artist: "Adele" },

  { year: 2023, songName: "Anti-Hero", artist: "Taylor Swift" },
  { year: 2023, songName: "Flowers", artist: "Miley Cyrus" },
  { year: 2023, songName: "Kill Bill", artist: "SZA" },
  { year: 2023, songName: "Last Night", artist: "Morgan Wallen" },

  { year: 2024, songName: "Lose Control", artist: "Teddy Swims" },
  { year: 2024, songName: "A Bar Song (Tipsy)", artist: "Shaboozey" },
  { year: 2024, songName: "Beautiful Things", artist: "Benson Boone" },
  { year: 2024, songName: "I Had Some Help", artist: "Post Malone featuring Morgan Wallen" }
];

const songsPull = mergeYearIntoSongs(songsInfo, enrichedSongs);

export function getRandomSong() {
  return songsPull[Math.floor(Math.random() * songsPull.length)];
}

export const fillThePull = async () => {
  console.log("Start filling the pull");
  const enrichedPull: any = [];

  const saveToJson = (enrichedPull: any) => {
    try {
      writeFileSync("songs-pull.json", JSON.stringify(enrichedPull));
      console.log("📂 File Saved");
    } catch {
      console.log("❌ Error Saving File");
    }
  };

  for (const song of songsPull.slice(19)) {
    console.log("📢 Start enriching song: ", song.songName);
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [{ role: "user", content: guessTheSongPrompt(JSON.stringify(song)) }],
          temperature: 0.7,
          max_tokens: 400
        })
      });

      if (!response.ok) {
        // ✅ Log the correct error details
        const errorText = await response.text();
        console.error(`OpenAI API Error: ${response.status} - ${response.statusText} | Details: ${errorText}`);
        throw new Error(`OpenAI API Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();

      // ✅ Make sure the response contains valid JSON before parsing
      const responseText = data?.choices?.[0]?.message?.content?.trim();
      if (!responseText) {
        throw new Error("OpenAI API did not return a valid response.");
      }

      // ✅ Try parsing the JSON safely
      let songData;
      try {
        songData = JSON.parse(responseText);
        enrichedPull.push(songData);
        console.log("✅ Song enriched: ", song.songName);
        saveToJson(enrichedPull);
      } catch (jsonError) {
        console.error("JSON Parsing Error:", jsonError);
        throw new Error("Failed to parse OpenAI response as JSON.");
      }
    } catch (error) {
      console.error("Error generating song:", error);
    }
  }
};
