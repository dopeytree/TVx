import { XMLParser } from 'fast-xml-parser';
import { Program, EPGData } from "@/types/iptv";
import { logger } from "./logger";

export const parseXMLTV = (content: string): EPGData => {
  // Clean the XML content to fix common issues
  const cleanedContent = content
    .replace(/&(?![a-zA-Z#0-9]+;)/g, '&amp;') // Escape bare & that aren't entities
    .replace(/<([^>]+)>/g, (match, content) => { // Fix any malformed tags if needed
      return match;
    });

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    processEntities: true, // Now process entities since we escaped bare &
  });
  
  try {
    const result = parser.parse(cleanedContent);
    const epgData: EPGData = {};
    
    if (!result.tv || !result.tv.programme) {
      return epgData;
    }
    
    const programmes = Array.isArray(result.tv.programme) 
      ? result.tv.programme 
      : [result.tv.programme];
    
    programmes.forEach((prog: any) => {
      const channelId = prog['@_channel'];
      if (!channelId) return;
      
      const program: Program = {
        channelId,
        title: prog.title?.['#text'] || prog.title || 'Unknown Program',
        subTitle: prog['sub-title']?.['#text'] || prog['sub-title'],
        description: prog.desc?.['#text'] || prog.desc || '',
        start: parseXMLTVDate(prog['@_start']),
        end: parseXMLTVDate(prog['@_stop']),
        category: prog.category?.['#text'] || prog.category || undefined,
        icon: prog.icon?.['@_src'] || undefined,
        image: prog.image?.['@_src'] || undefined,
        episodeNum: prog['episode-num']?.['#text'] || prog['episode-num'] || undefined,
        year: prog.date ? parseInt(prog.date['#text'] || prog.date) : undefined,
      };

      // Parse season and episode from episode-num
      if (program.episodeNum) {
        const system = prog['episode-num']?.['@_system'];
        const { season, episode } = parseEpisodeNum(program.episodeNum, system);
        program.season = season;
        program.episode = episode;
      }

      // Parse credits
      if (prog.credits) {
        program.credits = {};
        const credits = prog.credits;
        if (credits.director) program.credits.director = Array.isArray(credits.director) ? credits.director : [credits.director];
        if (credits.actor) program.credits.actor = Array.isArray(credits.actor) ? credits.actor : [credits.actor];
        if (credits.writer) program.credits.writer = Array.isArray(credits.writer) ? credits.writer : [credits.writer];
        if (credits.presenter) program.credits.presenter = Array.isArray(credits.presenter) ? credits.presenter : [credits.presenter];
        if (credits.producer) program.credits.producer = Array.isArray(credits.producer) ? credits.producer : [credits.producer];
        if (credits.composer) program.credits.composer = Array.isArray(credits.composer) ? credits.composer : [credits.composer];
        if (credits.editor) program.credits.editor = Array.isArray(credits.editor) ? credits.editor : [credits.editor];
        if (credits.guest) program.credits.guest = Array.isArray(credits.guest) ? credits.guest : [credits.guest];
      }

      // Parse star rating
      if (prog['star-rating']) {
        const rating = prog['star-rating'];
        program.starRating = {
          value: rating.value?.['#text'] || rating.value || '',
          system: rating['@_system'] || 'unknown'
        };
      }

      if (!epgData[channelId]) {
        epgData[channelId] = [];
      }
      epgData[channelId].push(program);
    });
    
    const totalProgrammes = Object.values(epgData).reduce((sum, progs) => sum + progs.length, 0);
    logger.log(`Loaded EPG data for ${totalProgrammes} programmes`);
    console.log('Parsed EPG data:', epgData);
    
    // Sort programs by start time
    Object.keys(epgData).forEach(channelId => {
      epgData[channelId].sort((a, b) => a.start.getTime() - b.start.getTime());
    });
    
    return epgData;
  } catch (error) {
    logger.error(`Failed to parse XMLTV: ${error}`);
    console.log('Original content sample:', content.substring(0, 500));
    return {};
  }
};

const parseXMLTVDate = (dateStr: string): Date => {
  // XMLTV format: YYYYMMDDHHmmss +ZZZZ or YYYYMMDDHHmmss ZZZZ
  const datePart = dateStr.substring(0, 14);
  const tzPart = dateStr.substring(15).trim(); // +ZZZZ or -ZZZZ
  
  const year = parseInt(datePart.substring(0, 4));
  const month = parseInt(datePart.substring(4, 6)) - 1;
  const day = parseInt(datePart.substring(6, 8));
  const hour = parseInt(datePart.substring(8, 10));
  const minute = parseInt(datePart.substring(10, 12));
  const second = parseInt(datePart.substring(12, 14));
  
  // Parse timezone offset
  let offsetMinutes = 0;
  if (tzPart) {
    const sign = tzPart[0] === '+' ? 1 : -1;
    const offsetHours = parseInt(tzPart.substring(1, 3));
    const offsetMins = parseInt(tzPart.substring(3, 5));
    offsetMinutes = sign * (offsetHours * 60 + offsetMins);
  }
  
  // Create date in UTC, adjusting for the timezone offset
  const utcHour = hour - Math.floor(offsetMinutes / 60);
  const utcMinute = minute - (offsetMinutes % 60);
  
  return new Date(Date.UTC(year, month, day, utcHour, utcMinute, second));
};

const parseEpisodeNum = (episodeNum: string, system?: string): { season?: number; episode?: number } => {
  if (system === 'xmltv_ns' || episodeNum.includes('.')) {
    // xmltv_ns format: season.episode.part/total (0-based)
    const parts = episodeNum.split('.');
    if (parts.length >= 2) {
      return {
        season: parseInt(parts[0]) + 1,
        episode: parseInt(parts[1]) + 1
      };
    }
  } else if (episodeNum.includes('S') && episodeNum.includes('E')) {
    // SxEx format
    const match = episodeNum.match(/S(\d+)E(\d+)/);
    if (match) {
      return {
        season: parseInt(match[1]),
        episode: parseInt(match[2])
      };
    }
  }
  return {};
};
