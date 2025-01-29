export const formatSongName = (title: string) => {
  const pipeIndex = title.indexOf("|");
  const parenthesisIndex = title.indexOf("(");

  if (pipeIndex === -1 && parenthesisIndex === -1) {
    return title;
  }

  if (pipeIndex === -1) {
    return title.substring(0, parenthesisIndex).trim();
  }
  
  if (parenthesisIndex === -1) {
    return title.substring(0, pipeIndex).trim();
  }

  return title.substring(0, Math.min(pipeIndex, parenthesisIndex)).trim();
};
