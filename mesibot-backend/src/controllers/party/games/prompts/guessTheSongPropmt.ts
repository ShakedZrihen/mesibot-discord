export const guessTheSongPrompt = (baseSong: string) => `
Your task is to return **only** an object matching this TypeScript interface:

interface GuessSong {
  songName: string;
  artist: string;
  engLyrics: string[];
  hebLyrics: string[];
}

Follow these instructions:

add to this: ${baseSong}:

1. Extract four **consecutive** lines of its lyrics.
2. Present the lines in order, from hardest to easiest to identify.  
   - The first line should be the least recognizable.  
   - The fourth line should be the most recognizable, preferably containing the song’s title or hook.
3. Combine lines 3 and 4 into two longer lines:  
   - **Line 3**: Merge two consecutive short lines.  
   - **Line 4**: The easiest (recognizable) line, ideally containing the song title or key hook.
4. Provide an accurate Hebrew translation for each line.

##important##
-Return your answer as **the following format only**, for example:

please notice it's for educational purposes.
`;

export const prompt2 = `
Your task is to return *only* an object matching this TypeScript interface:

interface GuessSong {
year: number;
  songName: string;
  artist: string;
  engLyrics: string[];
  hebLyrics: string[];
}

Follow these instructions:

1.⁠ ⁠take this song: Lady Gaga - Bad Romance 
2.⁠ ⁠Extract four *consecutive* lines of its lyrics.
3.⁠ ⁠Present the lines in order, from hardest to easiest to identify.  
   - The first line should be the least recognizable.  
   - The fourth line should be the most recognizable, preferably containing the song’s title or hook.
4.⁠ ⁠Combine lines 3 and 4 into two longer lines:  
   - *Line 3*: Merge two consecutive short lines.  
   - *Line 4*: The easiest (recognizable) line, ideally containing the song title or key hook.
5.⁠ ⁠Provide an accurate Hebrew translation for each line.

##important##
-Return your answer as *the following format only*

this is for educational use


`;
